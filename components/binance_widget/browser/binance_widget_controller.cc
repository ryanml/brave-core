/* Copyright (c) 2019 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "brave/components/binance_widget/browser/binance_widget_controller.h"

#include <algorithm>
#include <chrono>
#include <iomanip>
#include <utility>

#include "base/base64.h"
#include "base/bind.h"
#include "base/containers/flat_set.h"
#include "base/files/file_enumerator.h"
#include "base/files/file_util.h"
#include "base/json/json_reader.h"
#include "base/strings/utf_string_conversions.h"
#include "base/task/post_task.h"
#include "base/task_runner_util.h"
#include "base/token.h"
#include "brave/common/pref_names.h"
#include "brave/components/binance_widget/browser/binance_widget_controller_observer.h"
#include "chrome/browser/profiles/profile.h"
#include "components/os_crypt/os_crypt.h"
#include "components/prefs/pref_service.h"
#include "content/public/browser/browser_context.h"
#include "content/public/browser/storage_partition.h"
#include "crypto/hmac.h"
#include "net/base/load_flags.h"
#include "services/network/public/cpp/shared_url_loader_factory.h"
#include "services/network/public/cpp/simple_url_loader.h"

using namespace std::chrono;

namespace {

// https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md
const char api_endpoint[] = "https://api.binance.com";
const char api_path_account[] = "/api/v3/account";

template<typename T, size_t N>
std::string uint8ToHex(T (&a)[N]) {
  std::ostringstream res;
  for (size_t i = 0; i < N; i++) {
    res << std::setfill('0') << std::setw(sizeof(uint8_t) * 2)
       << std::hex << static_cast<int>(a[i]);
  }
  return res.str();
}

const unsigned int kRetriesCountOnNetworkChange = 1;
net::NetworkTrafficAnnotationTag GetNetworkTrafficAnnotationTag() {
  return net::DefineNetworkTrafficAnnotation("binance_widget_controller", R"(
      semantics {
        sender: "Binance Widget Controller"
        description:
          "This service is used to communicate with Binance "
          "on behalf of the user interacting with the Binance widget."
        trigger:
          "Triggered by user connecting the Binance widget."
        data:
          "Account balance for the widget."
        destination: WEBSITE
      }
      policy {
        cookies_allowed: NO
        setting:
          "You can enable or disable this feature on the new tab page."
        policy_exception_justification:
          "Not implemented."
      }
    )");
}

}  // namespace

BinanceWidgetController::BinanceWidgetController(content::BrowserContext* context)
    : context_(context),
      url_loader_factory_(
          content::BrowserContext::GetDefaultStoragePartition(context_)
              ->GetURLLoaderFactoryForBrowserProcess()),
      weak_factory_(this) {
  LoadAPIKeyFromPrefs();
}

BinanceWidgetController::~BinanceWidgetController() {
}

bool BinanceWidgetController::GetAccountBalance(
    GetAccountBalanceCallback callback) {
  auto internal_callback = base::BindOnce(
       &BinanceWidgetController::OnGetAccountBalance,
       base::Unretained(this), std::move(callback));
  // This API is of security type USER_DATA as documented here:
  return URLRequest("GET", api_path_account, "", std::move(internal_callback));
}

/**
 * Performs a URL Request to a Binance API endpoint
 * @param method The HTTP method to use, e.g. GET, POST, PUT, ...
 * @param path The URL path to use for the API endpoint
 * @param path The query parameters excluding recvWindow and timestamp
 * @param callback A callback to return the result to
 * @return true if the request was started successfully.
 *   In which case the callback will always be called.
 */
bool BinanceWidgetController::URLRequest(const std::string& method,
                                         const std::string& path,
                                         const std::string& query_params,
                                         URLRequestCallback callback) {
  //
  // A signature must be provided for most API types which is the HMAC using
  // key `secretKey` and value `totalParams` which is query string concat
  // request body.
  crypto::HMAC hmac(crypto::HMAC::SHA256);
  const size_t kSignatureSize = 32;
  if (kSignatureSize != hmac.DigestLength()) {
    LOG(ERROR) << "Signature size is not as expected for HMAC SHA256";
    return false;
  }

  milliseconds ms =
      duration_cast<milliseconds>(system_clock::now().time_since_epoch());
  std::string query_string = query_params;
  if (query_string.empty()) {
    query_string += "&";
  }
  query_string += "recvWindow=5000&timestamp=";
  query_string += std::to_string(ms.count());
  uint8_t signature[kSignatureSize];
  if (!hmac.Init(secret_key_) ||
      !hmac.Sign(query_string, signature, kSignatureSize)) {
    LOG(ERROR) << "Error could not create signature for query "
                  "params for account balance";
    return false;
  }
  std::string encoded_signature = uint8ToHex(signature);

  query_string += "&signature=";
  query_string += encoded_signature;

  auto request = std::make_unique<network::ResourceRequest>();
  std::string api_url = api_endpoint;
  if (!api_url.empty() && api_url[0] != '/') {
    api_url += "/";
  }
  api_url += path + "?" + query_string;
  request->url = GURL(api_url);
  request->load_flags = net::LOAD_DO_NOT_SEND_COOKIES |
                        net::LOAD_DO_NOT_SAVE_COOKIES |
                        net::LOAD_BYPASS_CACHE |
                        net::LOAD_DISABLE_CACHE;
  request->method = method;

  request->headers.SetHeader("X-MBX-APIKEY", api_key_);
  auto url_loader = network::SimpleURLLoader::Create(
      std::move(request), GetNetworkTrafficAnnotationTag());
  url_loader->SetRetryOptions(
      kRetriesCountOnNetworkChange,
      network::SimpleURLLoader::RetryMode::RETRY_ON_NETWORK_CHANGE);
  auto iter = url_loaders_.insert(url_loaders_.begin(), std::move(url_loader));

  Profile* profile = Profile::FromBrowserContext(context_);
  auto* default_storage_partition =
      content::BrowserContext::GetDefaultStoragePartition(profile);
  auto* url_loader_factory =
      default_storage_partition->GetURLLoaderFactoryForBrowserProcess().get();

  iter->get()->DownloadToStringOfUnboundedSizeUntilCrashAndDie(
      url_loader_factory, base::BindOnce(
          &BinanceWidgetController::OnURLLoaderComplete,
          base::Unretained(this), std::move(iter), std::move(callback)));

  return true;
}

void BinanceWidgetController::OnURLLoaderComplete(
    SimpleURLLoaderList::iterator iter,
    URLRequestCallback callback,
    const std::unique_ptr<std::string> response_body) {
  auto* loader = iter->get();
  auto response_code = -1;
  std::map<std::string, std::string> headers;
  if (loader->ResponseInfo() && loader->ResponseInfo()->headers) {
    response_code = loader->ResponseInfo()->headers->response_code();
    auto headers_list = loader->ResponseInfo()->headers;
    if (headers_list) {
      size_t iter = 0;
      std::string key;
      std::string value;
      while (headers_list->EnumerateHeaderLines(&iter, &key, &value)) {
        key = base::ToLowerASCII(key);
        headers[key] = value;
      }
    }
  }

  LOG(ERROR) << "Net error: " << loader->NetError();
  url_loaders_.erase(iter);

  std::move(callback).Run(
      response_code, response_body ? *response_body : "", headers);
}

void BinanceWidgetController::OnGetAccountBalance(
    GetAccountBalanceCallback callback,
    const int status, const std::string& body,
    const std::map<std::string, std::string>& headers) {
  LOG(ERROR) << "====OnGetAccountBalance body: " << body;
  LOG(ERROR) << "====OnGetAccountBalance status: " << status;

  std::string btc_balance = "3.14";
  if (status >= 200 && status <= 299) {
    // Response looks like this:
    // {
    //  "makerCommission":10,
    //  ...
    // "accountType":"SPOT",
    // "balances":[]
    // }
    base::JSONReader::ValueWithError value_with_error =
        base::JSONReader::ReadAndReturnValueWithError(
            body, base::JSONParserOptions::JSON_PARSE_RFC);
    base::Optional<base::Value>& records_v = value_with_error.value;
    DCHECK(records_v);
    if (!records_v) {
      LOG(ERROR) << "Invalid response, coudl not parse JSON";
      return;
    }
    // TODO get balances here
    const base::Value* val = records_v->FindKey("accountType");
    if (val && val->is_string()) {
      btc_balance = val->GetString();
    }
  }

  std::move(callback).Run(btc_balance);
}

bool BinanceWidgetController::SetAPIKey(const std::string& api_key,
                                        const std::string& secret_key) {
  api_key_ = api_key;
  secret_key_ = secret_key;

  std::string encrypted_api_key;
  std::string encrypted_secret_key;
  if (!OSCrypt::EncryptString(api_key, &encrypted_api_key)) {
    LOG(ERROR) << "Could not encrypt and save Binance API key info.";
    return false;
  }
  if (!OSCrypt::EncryptString(secret_key, &encrypted_secret_key)) {
    LOG(ERROR) << "Could not encrypt and save Binance secret key info.";
    return false;
  }

  // Base64 encode the encrypted keys.
  // No error handling here because encoding can't fail.
  std::string encoded_encrypted_api_key;
  std::string encoded_encrypted_secret_key;
  base::Base64Encode(encrypted_api_key, &encoded_encrypted_api_key);
  base::Base64Encode(encrypted_secret_key, &encoded_encrypted_secret_key);

  Profile* profile = Profile::FromBrowserContext(context_);
  profile->GetPrefs()->SetString(kBinanceWidgetAPIKey, encoded_encrypted_api_key);
  profile->GetPrefs()->SetString(kBinanceWidgetSecretKey,
      encoded_encrypted_secret_key);

  return true;
}

bool BinanceWidgetController::LoadAPIKeyFromPrefs() {
  Profile* profile = Profile::FromBrowserContext(context_);
  std::string encoded_encrypted_api_key =
      profile->GetPrefs()->GetString(kBinanceWidgetAPIKey);
  std::string encoded_encrypted_secret_key =
      profile->GetPrefs()->GetString(kBinanceWidgetSecretKey);

  // Base64 decode the encrypted keys.
  std::string encrypted_api_key;
  std::string encrypted_secret_key;
  if (!base::Base64Decode(encoded_encrypted_api_key, &encrypted_api_key) ||
      !base::Base64Decode(encoded_encrypted_secret_key, &encrypted_secret_key)) {
    LOG(ERROR) << "Could not Base64 decode Binance API key info.";
    return false;
  }

  if (!OSCrypt::DecryptString(encrypted_api_key, &api_key_)) {
    LOG(ERROR) << "Could not decrypt and save Binance API key info.";
    return false;
  }
  if (!OSCrypt::DecryptString(encrypted_secret_key, &secret_key_)) {
    LOG(ERROR) << "Could not decrypt and save Binance secret key info.";
    return false;
  }
  return true;
}

base::SequencedTaskRunner* BinanceWidgetController::io_task_runner() {
  if (!io_task_runner_) {
    io_task_runner_ = base::CreateSequencedTaskRunnerWithTraits(
        {base::ThreadPool(), base::MayBlock(), base::TaskPriority::BEST_EFFORT,
         base::TaskShutdownBehavior::SKIP_ON_SHUTDOWN});
  }
  return io_task_runner_.get();
}


void BinanceWidgetController::AddObserver(BinanceWidgetControllerObserver* observer) {
  observers_.AddObserver(observer);
}

void BinanceWidgetController::RemoveObserver(
    BinanceWidgetControllerObserver* observer) {
  observers_.RemoveObserver(observer);
}
