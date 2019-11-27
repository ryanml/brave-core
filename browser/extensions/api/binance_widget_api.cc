/* Copyright (c) 2019 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "brave/browser/extensions/api/binance_widget_api.h"

#include <memory>
#include <string>

#include "base/environment.h"
#include "brave/browser/profiles/profile_util.h"
#include "brave/common/extensions/api/binance_widget.h"
#include "brave/common/extensions/extension_constants.h"
#include "brave/common/pref_names.h"
#include "brave/browser/binance_widget/binance_widget_service_factory.h"
#include "brave/components/binance_widget/browser/binance_widget_controller.h"
#include "brave/components/binance_widget/browser/binance_widget_service.h"
#include "chrome/browser/extensions/api/tabs/tabs_constants.h"
#include "chrome/browser/extensions/extension_tab_util.h"
#include "chrome/browser/infobars/infobar_service.h"
#include "chrome/browser/profiles/profile.h"
#include "components/prefs/pref_service.h"
#include "extensions/browser/extension_util.h"

namespace {

BinanceWidgetController* GetBinanceWidgetController(content::BrowserContext* context) {
  return BinanceWidgetServiceFactory::GetInstance()
      ->GetForProfile(Profile::FromBrowserContext(context))
      ->controller();
}

}

namespace extensions {
namespace api {

ExtensionFunction::ResponseAction
BinanceWidgetGetAccountBalanceFunction::Run() {
  Profile* profile = Profile::FromBrowserContext(browser_context());
  if (brave::IsTorProfile(profile)) {
    return RespondNow(Error("Not available in Tor profile"));
  }
  auto* controller = GetBinanceWidgetController(browser_context());
  if (!controller->GetAccountBalance(
      base::BindOnce(
          &BinanceWidgetGetAccountBalanceFunction::OnGetAccountBalance,
          this))) {
    return RespondNow(Error("Could not send request to get balance"));
  }
  return RespondLater();
}

void BinanceWidgetGetAccountBalanceFunction::OnGetAccountBalance(
    const std::string& btc_balance) {
  Respond(OneArgument(std::make_unique<base::Value>(btc_balance)));
}

ExtensionFunction::ResponseAction
BinanceWidgetSetAPIKeyFunction::Run() {
  std::unique_ptr<binance_widget::SetAPIKey::Params> params(
      binance_widget::SetAPIKey::Params::Create(*args_));
  EXTENSION_FUNCTION_VALIDATE(params.get());

  Profile* profile = Profile::FromBrowserContext(browser_context());
  if (brave::IsTorProfile(profile)) {
    return RespondNow(Error("Not available in Tor profile"));
  }

  LOG(ERROR) << "API key is: " << params->api_key;
  LOG(ERROR) << "Secret key is: " << params->secret_key;
  auto* controller = GetBinanceWidgetController(browser_context());
  if (!controller->SetAPIKey(params->api_key, params->secret_key)) {
    return RespondNow(Error("Could not set API key"));
  }

  return RespondNow(NoArguments());
}

ExtensionFunction::ResponseAction
BinanceWidgetGetUserTLDFunction::Run() {
  Profile* profile = Profile::FromBrowserContext(browser_context());
  if (brave::IsTorProfile(profile)) {
    return RespondNow(Error("Not available in Tor profile"));
  }

  auto* controller = GetBinanceWidgetController(browser_context());
  const std::string userTLD = controller->GetBinanceTLD();

  return RespondNow(OneArgument(
      std::make_unique<base::Value>(userTLD)));
}

ExtensionFunction::ResponseAction
BinanceWidgetValidateAPIKeyFunction::Run() {
  Profile* profile = Profile::FromBrowserContext(browser_context());
  if (brave::IsTorProfile(profile)) {
    return RespondNow(Error("Not available in Tor profile"));
  }

  auto* controller = GetBinanceWidgetController(browser_context());
  if (!controller->ValidateAPIKey(
      base::BindOnce(
          &BinanceWidgetValidateAPIKeyFunction::OnValidateAPIKey,
          this))) {
    return RespondNow(Error("Could not send request to validate API key"));
  }
  return RespondLater();
}

void BinanceWidgetValidateAPIKeyFunction::OnValidateAPIKey(
    int status_code, bool unauthorized) {
  Respond(TwoArguments(std::make_unique<base::Value>(status_code),
                       std::make_unique<base::Value>(unauthorized)));
}

ExtensionFunction::ResponseAction
BinanceWidgetGetBTCUSDValueFunction::Run() {
  Profile* profile = Profile::FromBrowserContext(browser_context());
  if (brave::IsTorProfile(profile)) {
    return RespondNow(Error("Not available in Tor profile"));
  }

  auto* controller = GetBinanceWidgetController(browser_context());
  bool value_request = controller->GetBTCUSDValue(base::BindOnce(
      &BinanceWidgetGetBTCUSDValueFunction::OnGetBTCUSDValue, this));

  if (!value_request) {
    return RespondNow(
        Error("Could not make request for BTC price"));
  }

  return RespondLater();
}

void BinanceWidgetGetBTCUSDValueFunction::OnGetBTCUSDValue(
    const std::string& btc_usd_value) {
  Respond(OneArgument(std::make_unique<base::Value>(btc_usd_value)));
}

}  // namespace api
}  // namespace extensions
