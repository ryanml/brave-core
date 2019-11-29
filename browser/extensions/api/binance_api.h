/* Copyright (c) 2019 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef BRAVE_BROWSER_EXTENSIONS_API_BINANCE_API_H_
#define BRAVE_BROWSER_EXTENSIONS_API_BINANCE_API_H_

#include <string>

#include "extensions/browser/extension_function.h"

class Profile;

namespace extensions {
namespace api {

class BinanceGetAccountBalanceFunction :
    public ExtensionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("binance.getAccountBalance", UNKNOWN)

 protected:
  ~BinanceGetAccountBalanceFunction() override {}
  void OnGetAccountBalance(const std::string& btc_balance);

  ResponseAction Run() override;
};

class BinanceSetAPIKeyFunction :
    public ExtensionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("binance.setAPIKey", UNKNOWN)

 protected:
  ~BinanceSetAPIKeyFunction() override {}

  ResponseAction Run() override;
};

class BinanceGetUserTLDFunction :
    public ExtensionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("binance.getUserTLD", UNKNOWN)

 protected:
  ~BinanceGetUserTLDFunction() override {}
  ResponseAction Run() override;
};

class BinanceValidateAPIKeyFunction :
    public ExtensionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("binance.validateAPIKey", UNKNOWN)

 protected:
  ~BinanceValidateAPIKeyFunction() override {}
  void OnValidateAPIKey(int status_code, bool unauthorized);
  ResponseAction Run() override;
};

class BinanceGetTickerPriceFunction :
    public ExtensionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("binance.getTickerPrice", UNKNOWN)

 protected:
  ~BinanceGetTickerPriceFunction() override {}
  void OnGetTickerPrice(const std::string& symbol_pair_price);

  ResponseAction Run() override;
};

}  // namespace api
}  // namespace extensions

#endif  // BRAVE_BROWSER_EXTENSIONS_API_BINANCE_API_H_
