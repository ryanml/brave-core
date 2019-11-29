/* Copyright (c) 2019 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "brave/browser/extensions/api/binance_api.h"

#include <memory>
#include <string>

#include "base/environment.h"
#include "brave/browser/profiles/profile_util.h"
#include "brave/common/extensions/api/binance.h"
#include "brave/common/extensions/extension_constants.h"
#include "brave/common/pref_names.h"
#include "brave/browser/binance/binance_service_factory.h"
#include "brave/components/binance/browser/binance_controller.h"
#include "brave/components/binance/browser/binance_service.h"
#include "chrome/browser/extensions/api/tabs/tabs_constants.h"
#include "chrome/browser/extensions/extension_tab_util.h"
#include "chrome/browser/infobars/infobar_service.h"
#include "chrome/browser/profiles/profile.h"
#include "components/prefs/pref_service.h"
#include "extensions/browser/extension_util.h"

namespace {

BinanceController* GetBinanceController(content::BrowserContext* context) {
  return BinanceServiceFactory::GetInstance()
      ->GetForProfile(Profile::FromBrowserContext(context))
      ->controller();
}

}

namespace extensions {
namespace api {

ExtensionFunction::ResponseAction
BinanceGetAccountBalanceFunction::Run() {
  Profile* profile = Profile::FromBrowserContext(browser_context());
  if (brave::IsTorProfile(profile)) {
    return RespondNow(Error("Not available in Tor profile"));
  }
  auto* controller = GetBinanceController(browser_context());
  if (!controller->GetAccountBalance(
      base::BindOnce(
          &BinanceGetAccountBalanceFunction::OnGetAccountBalance,
          this))) {
    return RespondNow(Error("Could not send request to get balance"));
  }
  return RespondLater();
}

void BinanceGetAccountBalanceFunction::OnGetAccountBalance(
    const std::map<std::string, std::string>& balances, int status,
    bool unauthorized) {
  std::string btc_balance = "-";
  std::map<std::string, std::string>::const_iterator it = balances.find("BTC");
  if (it != balances.end()) {
    btc_balance = it->second;
  }
  Respond(TwoArguments(std::make_unique<base::Value>(btc_balance),
                       std::make_unique<base::Value>(unauthorized)));
}

ExtensionFunction::ResponseAction
BinanceSetAPIKeyFunction::Run() {
  std::unique_ptr<binance::SetAPIKey::Params> params(
      binance::SetAPIKey::Params::Create(*args_));
  EXTENSION_FUNCTION_VALIDATE(params.get());

  Profile* profile = Profile::FromBrowserContext(browser_context());
  if (brave::IsTorProfile(profile)) {
    return RespondNow(Error("Not available in Tor profile"));
  }

  LOG(ERROR) << "API key is: " << params->api_key;
  LOG(ERROR) << "Secret key is: " << params->secret_key;
  auto* controller = GetBinanceController(browser_context());
  if (!controller->SetAPIKey(params->api_key, params->secret_key)) {
    return RespondNow(Error("Could not set API key"));
  }

  return RespondNow(NoArguments());
}

ExtensionFunction::ResponseAction
BinanceGetUserTLDFunction::Run() {
  Profile* profile = Profile::FromBrowserContext(browser_context());
  if (brave::IsTorProfile(profile)) {
    return RespondNow(Error("Not available in Tor profile"));
  }

  auto* controller = GetBinanceController(browser_context());
  const std::string userTLD = controller->GetBinanceTLD();

  return RespondNow(OneArgument(
      std::make_unique<base::Value>(userTLD)));
}

ExtensionFunction::ResponseAction
BinanceValidateAPIKeyFunction::Run() {
  Profile* profile = Profile::FromBrowserContext(browser_context());
  if (brave::IsTorProfile(profile)) {
    return RespondNow(Error("Not available in Tor profile"));
  }

  auto* controller = GetBinanceController(browser_context());
  if (!controller->ValidateAPIKey(
      base::BindOnce(
          &BinanceValidateAPIKeyFunction::OnValidateAPIKey,
          this))) {
    return RespondNow(Error("Could not send request to validate API key"));
  }
  return RespondLater();
}

void BinanceValidateAPIKeyFunction::OnValidateAPIKey(
    int status_code, bool unauthorized) {
  Respond(TwoArguments(std::make_unique<base::Value>(status_code),
                       std::make_unique<base::Value>(unauthorized)));
}

ExtensionFunction::ResponseAction
BinanceGetTickerPriceFunction::Run() {
  std::unique_ptr<binance::GetTickerPrice::Params> params(
      binance::GetTickerPrice::Params::Create(*args_));
  EXTENSION_FUNCTION_VALIDATE(params.get());

  Profile* profile = Profile::FromBrowserContext(browser_context());
  if (brave::IsTorProfile(profile)) {
    return RespondNow(Error("Not available in Tor profile"));
  }

  auto* controller = GetBinanceController(browser_context());
  bool value_request = controller->GetTickerPrice(params->symbol_pair,
      base::BindOnce(
          &BinanceGetTickerPriceFunction::OnGetTickerPrice, this));

  if (!value_request) {
    return RespondNow(
        Error("Could not make request for BTC price"));
  }

  return RespondLater();
}

void BinanceGetTickerPriceFunction::OnGetTickerPrice(
    const std::string& symbol_pair_price) {
  Respond(OneArgument(std::make_unique<base::Value>(symbol_pair_price)));
}

}  // namespace api
}  // namespace extensions
