/* Copyright (c) 2020 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "brave/browser/extensions/api/gemini_api.h"

#include <memory>
#include <string>
#include <utility>
#include <vector>

#include "base/environment.h"
#include "brave/browser/profiles/profile_util.h"

#include "brave/common/extensions/api/gemini.h"
#include "brave/common/extensions/extension_constants.h"
#include "brave/common/pref_names.h"
#include "brave/browser/gemini/gemini_service_factory.h"
#include "brave/components/gemini/browser/gemini_service.h"
#include "chrome/browser/extensions/api/tabs/tabs_constants.h"
#include "chrome/browser/extensions/extension_tab_util.h"
#include "chrome/browser/infobars/infobar_service.h"
#include "chrome/browser/profiles/profile.h"
#include "components/prefs/pref_service.h"
#include "extensions/browser/extension_util.h"

namespace {

GeminiService* GetGeminiService(content::BrowserContext* context) {
  return GeminiServiceFactory::GetInstance()
      ->GetForProfile(Profile::FromBrowserContext(context));
}

bool IsGeminiAPIAvailable(content::BrowserContext* context) {
  Profile* profile = Profile::FromBrowserContext(context);
  return !brave::IsTorProfile(profile) &&
    !profile->IsIncognitoProfile() &&
    !profile->IsGuestSession();
}

}  // namespace

namespace extensions {
namespace api {

ExtensionFunction::ResponseAction
GeminiGetClientUrlFunction::Run() {
  if (!IsGeminiAPIAvailable(browser_context())) {
    return RespondNow(Error("Not available in Tor/incognito/guest profile"));
  }

  auto* service = GetGeminiService(browser_context());
  const std::string client_url = service->GetOAuthClientUrl();

  return RespondNow(OneArgument(
      std::make_unique<base::Value>(client_url)));
}

ExtensionFunction::ResponseAction
GeminiGetAccessTokenFunction::Run() {
  if (!IsGeminiAPIAvailable(browser_context())) {
    return RespondNow(Error("Not available in Tor/incognito/guest profile"));
  }

  auto* service = GetGeminiService(browser_context());
  bool token_request = service->GetAccessToken(base::BindOnce(
      &GeminiGetAccessTokenFunction::OnCodeResult, this));

  if (!token_request) {
    return RespondNow(
        Error("Could not make request for access tokens"));
  }

  return RespondLater();
}

void GeminiGetAccessTokenFunction::OnCodeResult(bool success) {
  Respond(OneArgument(std::make_unique<base::Value>(success)));
}

ExtensionFunction::ResponseAction
GeminiGetTickerPriceFunction::Run() {
  if (!IsGeminiAPIAvailable(browser_context())) {
    return RespondNow(Error("Not available in Tor/incognito/guest profile"));
  }

  std::unique_ptr<gemini::GetTickerPrice::Params> params(
      gemini::GetTickerPrice::Params::Create(*args_));
  EXTENSION_FUNCTION_VALIDATE(params.get());

  auto* service = GetGeminiService(browser_context());
  bool price_request = service->GetTickerPrice(
      params->asset,
      base::BindOnce(
          &GeminiGetTickerPriceFunction::OnPriceResult, this));

  if (!price_request) {
    return RespondNow(
        Error("Could not make request for price"));
  }

  return RespondLater();
}

void GeminiGetTickerPriceFunction::OnPriceResult(
    const std::string& price) {
  Respond(OneArgument(std::make_unique<base::Value>(price)));
}

ExtensionFunction::ResponseAction
GeminiGetAccountBalancesFunction::Run() {
  if (!IsGeminiAPIAvailable(browser_context())) {
    return RespondNow(Error("Not available in Tor/incognito/guest profile"));
  }

  auto* service = GetGeminiService(browser_context());
  bool balance_success = service->GetAccountBalances(
      base::BindOnce(
          &GeminiGetAccountBalancesFunction::OnGetAccountBalances,
          this));

  if (!balance_success) {
    return RespondNow(Error("Could not send request to get balance"));
  }

  return RespondLater();
}

void GeminiGetAccountBalancesFunction::OnGetAccountBalances(
    const std::map<std::string, std::string>& balances,
    bool auth_invalid) {
  auto result = std::make_unique<base::Value>(
      base::Value::Type::DICTIONARY);

  for (const auto& balance : balances) {
    result->SetStringKey(balance.first, balance.second);
  }

  Respond(TwoArguments(std::move(result),
                       std::make_unique<base::Value>(auth_invalid)));
}

ExtensionFunction::ResponseAction
GeminiGetDepositInfoFunction::Run() {
  if (!IsGeminiAPIAvailable(browser_context())) {
    return RespondNow(Error("Not available in Tor/incognito/guest profile"));
  }

  std::unique_ptr<gemini::GetDepositInfo::Params> params(
      gemini::GetDepositInfo::Params::Create(*args_));
  EXTENSION_FUNCTION_VALIDATE(params.get());

  auto* service = GetGeminiService(browser_context());
  bool info_request = service->GetDepositInfo(params->asset,
      base::BindOnce(
          &GeminiGetDepositInfoFunction::OnGetDepositInfo, this));

  if (!info_request) {
    return RespondNow(
        Error("Could not make request for deposit information."));
  }

  return RespondLater();
}

void GeminiGetDepositInfoFunction::OnGetDepositInfo(
    const std::string& deposit_address) {
  Respond(OneArgument(
      std::make_unique<base::Value>(deposit_address)));
}

ExtensionFunction::ResponseAction
GeminiRevokeTokenFunction::Run() {
  if (!IsGeminiAPIAvailable(browser_context())) {
    return RespondNow(Error("Not available in Tor/incognito/guest profile"));
  }

  auto* service = GetGeminiService(browser_context());
  bool request = service->RevokeAccessToken(base::BindOnce(
          &GeminiRevokeTokenFunction::OnRevokeToken, this));

  if (!request) {
    return RespondNow(
        Error("Could not revoke gemini access tokens"));
  }

  return RespondLater();
}

void GeminiRevokeTokenFunction::OnRevokeToken(bool success) {
  Respond(OneArgument(std::make_unique<base::Value>(success)));
}

ExtensionFunction::ResponseAction
GeminiGetOrderQuoteFunction::Run() {
  if (!IsGeminiAPIAvailable(browser_context())) {
    return RespondNow(Error("Not available in Tor/incognito/guest profile"));
  }

  std::unique_ptr<gemini::GetOrderQuote::Params> params(
      gemini::GetOrderQuote::Params::Create(*args_));
  EXTENSION_FUNCTION_VALIDATE(params.get());

  auto* service = GetGeminiService(browser_context());
  bool quote_request = service->GetOrderQuote(
      params->side, params->symbol, params->spend,
      base::BindOnce(
          &GeminiGetOrderQuoteFunction::OnOrderQuoteResult, this));

  if (!quote_request) {
    return RespondNow(
        Error("Could not make request for quote"));
  }

  return RespondLater();
}

void GeminiGetOrderQuoteFunction::OnOrderQuoteResult(
    const std::string& quote_id, const std::string& quantity,
    const std::string& fee, const std::string& price) {
  auto quote = std::make_unique<base::Value>(base::Value::Type::DICTIONARY);
  quote->SetStringKey("id", quote_id);
  quote->SetStringKey("quantity", quantity);
  quote->SetStringKey("fee", fee);
  quote->SetStringKey("price", price);
  Respond(OneArgument(std::move(quote)));
}

ExtensionFunction::ResponseAction
GeminiExecuteOrderFunction::Run() {
  if (!IsGeminiAPIAvailable(browser_context())) {
    return RespondNow(Error("Not available in Tor/incognito/guest profile"));
  }

  std::unique_ptr<gemini::ExecuteOrder::Params> params(
      gemini::ExecuteOrder::Params::Create(*args_));
  EXTENSION_FUNCTION_VALIDATE(params.get());

  auto* service = GetGeminiService(browser_context());
  bool balance_success = service->ExecuteOrder(
      params->symbol, params->side, params->quantity,
      params->price, params->fee, params->quote_id,
      base::BindOnce(
          &GeminiExecuteOrderFunction::OnOrderExecuted,
          this));

  if (!balance_success) {
    return RespondNow(Error("Could not send request to execute order"));
  }

  return RespondLater();
}

void GeminiExecuteOrderFunction::OnOrderExecuted(bool success) {
  Respond(OneArgument(std::make_unique<base::Value>(success)));
}

}  // namespace api
}  // namespace extensions
