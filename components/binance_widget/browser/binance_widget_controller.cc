/* Copyright (c) 2019 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "brave/components/binance_widget/browser/binance_widget_controller.h"

#include <algorithm>
#include <chrono>

#include "base/base64.h"
#include "base/bind.h"
#include "base/containers/flat_set.h"
#include "base/files/file_enumerator.h"
#include "base/files/file_util.h"
#include "base/strings/utf_string_conversions.h"
#include "base/task/post_task.h"
#include "base/task_runner_util.h"
#include "base/token.h"
#include "brave/common/pref_names.h"
#include "brave/components/binance_widget/browser/binance_crypto.h"
#include "brave/components/binance_widget/browser/binance_json_parser.h"
#include "chrome/browser/profiles/profile.h"
#include "components/os_crypt/os_crypt.h"
#include "components/prefs/pref_service.h"
#include "content/public/browser/browser_context.h"
#include "content/public/browser/storage_partition.h"
#include "net/base/load_flags.h"
#include "services/network/public/cpp/shared_url_loader_factory.h"
#include "services/network/public/cpp/simple_url_loader.h"
#include "components/country_codes/country_codes.h"

using namespace std::chrono;

// https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md
std::string BinanceWidgetController::api_endpoint_ =  "https://api.binance.com";

namespace {

const std::vector<std::string> public_endpoints = {
  api_path_ticker_price
};

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

bool BinanceWidgetController::ValidateAPIKey(
    ValidateAPIKeyCallback callback) {
  auto internal_callback = base::BindOnce(
       &BinanceWidgetController::OnValidateAPIKey,
       base::Unretained(this), std::move(callback));
  // This API is of security type USER_DATA as documented here:
  return URLRequest("GET", api_path_account, "", std::move(internal_callback));
}

bool BinanceWidgetController::GetBTCUSDValue(
    GetBTCUSDValueCallback callback) {
  auto internal_callback = base::BindOnce(
      &BinanceWidgetController::OnGetBTCUSDValue,
      base::Unretained(this), std::move(callback));
  return URLRequest("GET", api_path_ticker_price,
      "symbol=BTCUSDT", std::move(internal_callback));
}

// static
bool BinanceWidgetController::IsPublicEndpoint(
    const std::string& endpoint) {
  for (const std::string& path: public_endpoints) {
    if (path == endpoint) {
      return true;
    }
  }
  return false;
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
  std::string query_string = query_params;

  // Public endpoints won't accept extraneous parameters
  if (!IsPublicEndpoint(path)) {
    milliseconds ms =
        duration_cast<milliseconds>(system_clock::now().time_since_epoch());
    if (!query_string.empty()) {
      query_string += "&";
    }
    query_string += "recvWindow=5000&timestamp=";
    query_string += std::to_string(ms.count());
    std::string encoded_signature;
    if (!BinanceCrypto::GetSignatureForTotalParams(query_string,
                                                   secret_key_,
                                                   &encoded_signature)) {
      return false;
    }
    query_string += "&signature=";
    query_string += encoded_signature;
  }

  auto request = std::make_unique<network::ResourceRequest>();
  std::string api_url = api_endpoint_;
  std::string api_path = path;
  if (!api_path.empty() && api_path[0] != '/' &&
      !api_url.empty() && api_url.back() != '/') {
    api_path = "/" + api_path;
  }
  api_url += api_path + "?" + query_string;
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
  std::string btc_balance = "-";
  if (status >= 200 && status <= 299) {
    if (!BinanceJSONParser::GetBTCValueFromAccountJSON(body, &btc_balance)) {
      btc_balance = "-";
    }
  }
  std::move(callback).Run(btc_balance);
}

void BinanceWidgetController::OnValidateAPIKey(
    ValidateAPIKeyCallback callback,
    const int status, const std::string& body,
    const std::map<std::string, std::string>& headers) {
  std::move(callback).Run(status, status == 401);
}

void BinanceWidgetController::OnGetBTCUSDValue(
    GetBTCUSDValueCallback callback,
    const int status, const std::string& body,
    const std::map<std::string, std::string>& headers) {
  std::string btc_usd_value = "0.00";
  if (status >= 200 && status <= 299) {
    BinanceJSONParser::GetBTCUSDValueFromJSON(body, &btc_usd_value);
  }
  std::move(callback).Run(btc_usd_value);
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

std::string BinanceWidgetController::GetBinanceTLD() {
  Profile* profile = Profile::FromBrowserContext(context_);

  const std::string usTLD = "us";
  const std::string usCode = "US";
  const std::string globalTLD = "com";

  const int32_t user_country_id =
      country_codes::GetCountryIDFromPrefs(profile->GetPrefs());
  const int32_t us_id = country_codes::CountryCharsToCountryID(
      usCode.at(0), usCode.at(1));

  return (user_country_id == us_id) ? usTLD : globalTLD;
}

base::SequencedTaskRunner* BinanceWidgetController::io_task_runner() {
  if (!io_task_runner_) {
    io_task_runner_ = base::CreateSequencedTaskRunnerWithTraits(
        {base::ThreadPool(), base::MayBlock(), base::TaskPriority::BEST_EFFORT,
         base::TaskShutdownBehavior::SKIP_ON_SHUTDOWN});
  }
  return io_task_runner_.get();
}
