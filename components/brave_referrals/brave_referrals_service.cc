/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "brave/components/brave_referrals/brave_referrals_service.h"

#include "base/environment.h"
#include "base/files/file_path.h"
#include "base/files/file_util.h"
#include "base/json/json_reader.h"
#include "base/json/json_writer.h"
#include "base/path_service.h"
#include "base/strings/string_util.h"
#include "base/sys_info.h"
#include "base/task/post_task.h"
#include "base/values.h"
#include "brave/common/network_constants.h"
#include "brave/common/pref_names.h"
#include "chrome/browser/browser_process.h"
#include "chrome/browser/net/system_network_context_manager.h"
#include "chrome/browser/profiles/profile_manager.h"
#include "chrome/browser/ui/browser.h"
#include "chrome/browser/ui/scoped_tabbed_browser_displayer.h"
#include "chrome/common/chrome_paths.h"
#include "components/prefs/pref_registry_simple.h"
#include "components/prefs/pref_service.h"
#include "net/base/load_flags.h"
#include "net/traffic_annotation/network_traffic_annotation.h"
#include "services/network/public/cpp/resource_request.h"
#include "services/network/public/cpp/simple_url_loader.h"

// Fetch headers from the referral server once a day.
const int kFetchReferralHeadersFrequency = 60 * 60 * 24;

// Maximum size of the referral server response in bytes.
const int kMaxReferralServerResponseSizeBytes = 1024 * 1024;

namespace {

std::string GetPlatformIdentifier() {
#if defined(OS_WIN)
  if (base::SysInfo::OperatingSystemArchitecture() == "x86")
    return "winia32";
  else
    return "winx64";
#elif defined(OS_MACOSX)
  return "osx";
#elif defined(OS_LINUX)
  return "linux";
#else
  return std::string();
#endif
}

std::string BuildReferralEndpoint(const std::string& path) {
  std::unique_ptr<base::Environment> env(base::Environment::Create());
  std::string referral_server;
  env->GetVar("BRAVE_REFERRAL_SERVER", &referral_server);
  if (referral_server.empty())
    referral_server = kBraveReferralServer;
  return base::StringPrintf("https://%s%s", referral_server.c_str(),
                            path.c_str());
}

} // namespace

namespace brave {

BraveReferralsService::BraveReferralsService(PrefService* pref_service)
    : task_runner_(
          base::CreateSequencedTaskRunnerWithTraits({base::MayBlock()})),
      pref_service_(pref_service),
      weak_factory_(this) {
}

BraveReferralsService::~BraveReferralsService() {
}

void BraveReferralsService::Start() {
  DCHECK(!fetch_referral_headers_timer_);
  fetch_referral_headers_timer_ = std::make_unique<base::RepeatingTimer>();
  fetch_referral_headers_timer_->Start(
      FROM_HERE, base::TimeDelta::FromSeconds(kFetchReferralHeadersFrequency),
      this, &BraveReferralsService::OnFetchReferralHeadersTimerFired);
  DCHECK(fetch_referral_headers_timer_->IsRunning());

  std::string download_id = pref_service_->GetString(kReferralDownloadID);
  if (download_id.empty())
    task_runner_->PostTaskAndReply(
        FROM_HERE,
        base::Bind(&BraveReferralsService::PerformFirstRunTasks,
                   base::Unretained(this)),
        base::Bind(&BraveReferralsService::OnFirstRunTasksComplete,
                   weak_factory_.GetWeakPtr()));
  else
    FetchReferralHeaders();
}

void BraveReferralsService::Stop() {
  return fetch_referral_headers_timer_.reset();
}

void BraveReferralsService::OnFetchReferralHeadersTimerFired() {
  FetchReferralHeaders();
}

void BraveReferralsService::OnReferralHeadersLoadComplete(
    std::unique_ptr<std::string> response_body) {
  int response_code = -1;
  if (referral_headers_loader_->ResponseInfo() &&
      referral_headers_loader_->ResponseInfo()->headers)
    response_code =
        referral_headers_loader_->ResponseInfo()->headers->response_code();
  if (referral_headers_loader_->NetError() != net::OK || response_code != 200) {
    LOG(ERROR) << "Failed to fetch headers from referral server"
               << ", error: " << referral_headers_loader_->NetError()
               << ", response code: " << response_code
               << ", payload: " << *response_body
               << ", url: " << referral_headers_loader_->GetFinalURL().spec();
    return;
  }

  std::unique_ptr<base::Value> root = base::JSONReader().ReadToValue(*response_body);
  if (!root || !root->is_list()) {
    LOG(ERROR) << "Failed to parse referral headers response";
    return;
  }
  pref_service_->Set(kReferralHeaders, *root);
}

void BraveReferralsService::OnReferralInitLoadComplete(
    std::unique_ptr<std::string> response_body) {
  int response_code = -1;
  if (referral_init_loader_->ResponseInfo() &&
      referral_init_loader_->ResponseInfo()->headers)
    response_code =
        referral_init_loader_->ResponseInfo()->headers->response_code();
  if (referral_init_loader_->NetError() != net::OK || response_code != 200) {
    LOG(ERROR) << "Failed to initialize referral"
               << ", error: " << referral_init_loader_->NetError()
               << ", response code: " << response_code
               << ", payload: " << *response_body
               << ", url: " << referral_init_loader_->GetFinalURL().spec();
    return;
  }

  std::unique_ptr<base::Value> root = base::JSONReader().ReadToValue(*response_body);
  if (!root || !root->is_dict()) {
    LOG(ERROR) << "Failed to parse referral initialization response";
    return;
  }
  if (!root->FindKey("download_id")) {
    LOG(ERROR) << "Failed to locate download_id in referral initialization response"
               << ", payload: " << *response_body;
    return;
  }

  const base::Value* offer_page_url = root->FindKey("offer_page_url");
  if (offer_page_url) {
    chrome::ScopedTabbedBrowserDisplayer browser_displayer(
        ProfileManager::GetLastUsedProfile());
    browser_displayer.browser()->OpenURL(content::OpenURLParams(
        GURL(offer_page_url->GetString()), content::Referrer(),
        WindowOpenDisposition::NEW_FOREGROUND_TAB,
        ui::PAGE_TRANSITION_AUTO_TOPLEVEL, false));
  }

  if (root->FindKey("headers")) {
    const base::Value* headers = root->FindKey("headers");
    pref_service_->Set(kReferralHeaders, *headers);
  }

  const base::Value* download_id = root->FindKey("download_id");
  pref_service_->SetString(kReferralDownloadID, download_id->GetString());

  const base::Value* referral_code = root->FindKey("referral_code");
  pref_service_->SetString(kReferralPromoCode, referral_code->GetString());

  task_runner_->PostTask(FROM_HERE,
                         base::Bind(&BraveReferralsService::DeletePromoCodeFile,
                                    base::Unretained(this)));
}

void BraveReferralsService::OnReferralActivityCheckLoadComplete(
    std::unique_ptr<std::string> response_body) {
  int response_code = -1;
  if (referral_activity_check_loader_->ResponseInfo() &&
      referral_activity_check_loader_->ResponseInfo()->headers)
    response_code = referral_activity_check_loader_->ResponseInfo()
                        ->headers->response_code();
  if (referral_activity_check_loader_->NetError() != net::OK ||
      response_code != 200) {
    LOG(ERROR) << "Failed to perform referral activity check"
               << ", error: " << referral_activity_check_loader_->NetError()
               << ", response code: " << response_code
               << ", payload: " << *response_body << ", url: "
               << referral_activity_check_loader_->GetFinalURL().spec();
    return;
  }

  std::unique_ptr<base::Value> root = base::JSONReader().ReadToValue(*response_body);
  if (!root || !root->is_list()) {
    LOG(ERROR) << "Failed to parse referral activity check response";
    return;
  }
  const base::Value* finalized = root->FindKey("finalized");
  if (!finalized->GetBool()) {
    LOG(ERROR) << "Referral is not ready, please wait at least 30 days";
    return;
  }

  pref_service_->SetTime(kReferralTimestamp, base::Time::Now());
  pref_service_->ClearPref(kReferralAttemptTimestamp);
  pref_service_->ClearPref(kReferralAttemptCount);
}

void BraveReferralsService::OnFirstRunTasksComplete() {
  if (!promo_code_.empty())
    InitReferral();
}

void BraveReferralsService::PerformFirstRunTasks() {
  ReadPromoCode();
}

base::FilePath BraveReferralsService::GetPromoCodeFileName() const {
  base::FilePath user_data_dir;
  base::PathService::Get(chrome::DIR_USER_DATA, &user_data_dir);
  return user_data_dir.AppendASCII("promoCode");
}

bool BraveReferralsService::ReadPromoCode() {
  base::FilePath promo_code_file = GetPromoCodeFileName();
  if (!base::PathExists(promo_code_file)) {
    return false;
  }
  if (!base::ReadFileToString(promo_code_file, &promo_code_)) {
    LOG(ERROR) << "Failed to read referral promo code from "
               << promo_code_file.value().c_str();
    return false;
  }
  base::TrimWhitespaceASCII(promo_code_, base::TRIM_ALL, &promo_code_);
  if (promo_code_.empty()) {
    LOG(ERROR) << "Promo code file " << promo_code_file.value().c_str()
               << " is empty";
    return false;
  }
  return true;
}

void BraveReferralsService::DeletePromoCodeFile() const {
  base::FilePath promo_code_file = GetPromoCodeFileName();
  if (!base::DeleteFile(promo_code_file, false)) {
    LOG(ERROR) << "Failed to delete referral promo code file "
               << promo_code_file.value().c_str();
    return;
  }
}

std::string BraveReferralsService::BuildReferralInitPayload() const {
  std::unique_ptr<base::Environment> env(base::Environment::Create());
  std::string api_key;
  env->GetVar("REFERRAL_API_KEY", &api_key);
  base::Value root(base::Value::Type::DICTIONARY);
  root.SetKey("api_key", base::Value(api_key));
  root.SetKey("referral_code", base::Value(promo_code_));
  root.SetKey("platform", base::Value(GetPlatformIdentifier()));
  std::string result;
  base::JSONWriter::Write(root, &result);
  return result;
}

std::string BraveReferralsService::BuildReferralActivityCheckPayload() const {
  std::unique_ptr<base::Environment> env(base::Environment::Create());
  std::string api_key;
  env->GetVar("REFERRAL_API_KEY", &api_key);
  base::Value root(base::Value::Type::DICTIONARY);
  root.SetKey("api_key", base::Value(api_key));
  root.SetKey("download_id",
              base::Value(pref_service_->GetString(kReferralDownloadID)));
  std::string result;
  base::JSONWriter::Write(root, &result);
  return result;
}

void BraveReferralsService::FetchReferralHeaders() {
  net::NetworkTrafficAnnotationTag traffic_annotation =
      net::DefineNetworkTrafficAnnotation("brave_referral_headers_fetcher", R"(
        semantics {
          sender:
            "Brave Referrals Service"
          description:
            "Fetches referral headers from Brave."
          trigger:
            "An update timer indicates that it's time to fetch referral headers."
          data: "Brave referral headers."
          destination: WEBSITE
        }
        policy {
          cookies_allowed: NO
          setting:
            "This feature cannot be disabled by settings."
          policy_exception_justification:
            "Not implemented."
        })");
  auto resource_request = std::make_unique<network::ResourceRequest>();
  resource_request->url =
      GURL(BuildReferralEndpoint(kBraveReferralHeadersPath));
  resource_request->load_flags =
      net::LOAD_DO_NOT_SEND_COOKIES | net::LOAD_DO_NOT_SAVE_COOKIES |
      net::LOAD_BYPASS_CACHE | net::LOAD_DISABLE_CACHE |
      net::LOAD_DO_NOT_SEND_AUTH_DATA;
  network::mojom::URLLoaderFactory* loader_factory =
      g_browser_process->system_network_context_manager()
          ->GetURLLoaderFactory();
  referral_headers_loader_ = network::SimpleURLLoader::Create(
      std::move(resource_request), traffic_annotation);
  referral_headers_loader_->SetAllowHttpErrorResults(true);
  referral_headers_loader_->DownloadToString(
      loader_factory,
      base::BindOnce(&BraveReferralsService::OnReferralHeadersLoadComplete,
                     base::Unretained(this)),
      kMaxReferralServerResponseSizeBytes);
}

void BraveReferralsService::InitReferral() {
  net::NetworkTrafficAnnotationTag traffic_annotation =
      net::DefineNetworkTrafficAnnotation("brave_referral_initializer", R"(
        semantics {
          sender:
            "Brave Referrals Service"
          description:
            "Validates the current referral offer with Brave, potentially "
            "unlocking special features and/or services."
          trigger:
            "On startup, sends the current referral code to Brave."
          data: "Brave referral metadata."
          destination: WEBSITE
        }
        policy {
          cookies_allowed: NO
          setting:
            "This feature cannot be disabled by settings."
          policy_exception_justification:
            "Not implemented."
        })");
  auto resource_request = std::make_unique<network::ResourceRequest>();
  resource_request->method = "PUT";
  resource_request->url = GURL(BuildReferralEndpoint(kBraveReferralInitPath));
  resource_request->load_flags =
      net::LOAD_DO_NOT_SEND_COOKIES | net::LOAD_DO_NOT_SAVE_COOKIES |
      net::LOAD_BYPASS_CACHE | net::LOAD_DISABLE_CACHE |
      net::LOAD_DO_NOT_SEND_AUTH_DATA;
  network::mojom::URLLoaderFactory* loader_factory =
      g_browser_process->system_network_context_manager()
          ->GetURLLoaderFactory();
  referral_init_loader_ = network::SimpleURLLoader::Create(
      std::move(resource_request), traffic_annotation);
  referral_init_loader_->SetAllowHttpErrorResults(true);
  referral_init_loader_->AttachStringForUpload(BuildReferralInitPayload(),
                                               "application/json");
  referral_init_loader_->DownloadToString(
      loader_factory,
      base::BindOnce(&BraveReferralsService::OnReferralInitLoadComplete,
                     base::Unretained(this)),
      kMaxReferralServerResponseSizeBytes);
}

bool BraveReferralsService::ShouldCheckReferralActivity() const {
  std::string download_id = pref_service_->GetString(kReferralDownloadID);
  if (download_id.empty()) {
    return false;
  }

  base::Time timestamp = pref_service_->GetTime(kReferralAttemptTimestamp);
  int count = pref_service_->GetInteger(kReferralAttemptCount);

  if (count >= 30) {
    pref_service_->ClearPref(kReferralAttemptTimestamp);
    pref_service_->ClearPref(kReferralAttemptCount);
    pref_service_->ClearPref(kReferralDownloadID);
    return false;
  }

  base::Time now = base::Time::Now();
  if (now - timestamp < base::TimeDelta::FromHours(24))
    return false;

  pref_service_->SetTime(kReferralAttemptTimestamp, now);
  pref_service_->SetInteger(kReferralAttemptCount, count + 1);
  return true;
}

void BraveReferralsService::CheckReferralActivity() {
  net::NetworkTrafficAnnotationTag traffic_annotation =
      net::DefineNetworkTrafficAnnotation("brave_referral_activity_checker", R"(
        semantics {
          sender:
            "Brave Referrals Service"
          description:
            "Fetches referral activity from Brave."
          trigger:
            ""
          data: "Brave referral activity."
          destination: WEBSITE
        }
        policy {
          cookies_allowed: NO
          setting:
            "This feature cannot be disabled by settings."
          policy_exception_justification:
            "Not implemented."
        })");
  auto resource_request = std::make_unique<network::ResourceRequest>();
  resource_request->method = "PUT";
  resource_request->url =
      GURL(BuildReferralEndpoint(kBraveReferralActivityPath));
  resource_request->load_flags =
      net::LOAD_DO_NOT_SEND_COOKIES | net::LOAD_DO_NOT_SAVE_COOKIES |
      net::LOAD_BYPASS_CACHE | net::LOAD_DISABLE_CACHE |
      net::LOAD_DO_NOT_SEND_AUTH_DATA;
  network::mojom::URLLoaderFactory* loader_factory =
      g_browser_process->system_network_context_manager()
          ->GetURLLoaderFactory();
  referral_activity_check_loader_ = network::SimpleURLLoader::Create(
      std::move(resource_request), traffic_annotation);
  referral_activity_check_loader_->SetAllowHttpErrorResults(true);
  referral_activity_check_loader_->AttachStringForUpload(
      BuildReferralActivityCheckPayload(), "application/json");
  referral_activity_check_loader_->DownloadToString(
      loader_factory,
      base::BindOnce(
          &BraveReferralsService::OnReferralActivityCheckLoadComplete,
          base::Unretained(this)),
      kMaxReferralServerResponseSizeBytes);
}

///////////////////////////////////////////////////////////////////////////////

std::unique_ptr<BraveReferralsService> BraveReferralsServiceFactory(PrefService* pref_service) {
  return std::make_unique<BraveReferralsService>(pref_service);
}

void RegisterPrefsForBraveReferralsService(PrefRegistrySimple* registry) {
  registry->RegisterStringPref(kReferralPromoCode, std::string());
  registry->RegisterStringPref(kReferralDownloadID, std::string());
  registry->RegisterStringPref(kReferralTimestamp, std::string());
  registry->RegisterTimePref(kReferralAttemptTimestamp, base::Time());
  registry->RegisterIntegerPref(kReferralAttemptCount, 0);
  registry->RegisterListPref(kReferralHeaders);
}

}  // namespace brave
