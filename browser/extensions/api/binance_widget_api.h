/* Copyright (c) 2019 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef BRAVE_BROWSER_EXTENSIONS_API_BINANCE_WIDGET_API_H_
#define BRAVE_BROWSER_EXTENSIONS_API_BINANCE_WIDGET_API_H_

#include <string>

#include "extensions/browser/extension_function.h"

class Profile;

namespace extensions {
namespace api {

class BinanceWidgetGetAccountBalanceFunction :
    public ExtensionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("binanceWidget.getAccountBalance", UNKNOWN)

 protected:
  ~BinanceWidgetGetAccountBalanceFunction() override {}
  void OnGetAccountBalance(const std::string& btc_balance);

  ResponseAction Run() override;
};

class BinanceWidgetSetAPIKeyFunction :
    public ExtensionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("binanceWidget.setAPIKey", UNKNOWN)

 protected:
  ~BinanceWidgetSetAPIKeyFunction() override {}

  ResponseAction Run() override;
};

class BinanceWidgetGetUserTLDFunction :
    public ExtensionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("binanceWidget.getUserTLD", UNKNOWN)

 protected:
  ~BinanceWidgetGetUserTLDFunction() override {}
  ResponseAction Run() override;
};

class BinanceWidgetValidateAPIKeyFunction :
    public ExtensionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("binanceWidget.validateAPIKey", UNKNOWN)

 protected:
  ~BinanceWidgetValidateAPIKeyFunction() override {}
  void OnValidateAPIKey(int status_code, bool unauthorized);
  ResponseAction Run() override;
};

class BinanceWidgetGetBTCUSDValueFunction :
    public ExtensionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("binanceWidget.getBTCUSDValue", UNKNOWN)

 protected:
  ~BinanceWidgetGetBTCUSDValueFunction() override {}
  void OnGetBTCUSDValue(const std::string& btc_usd_value);

  ResponseAction Run() override;
};

}  // namespace api
}  // namespace extensions

#endif  // BRAVE_BROWSER_EXTENSIONS_API_BINANCE_WIDGET_API_H_
