/* Copyright (c) 2019 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef BRAVE_COMPONENTS_BINANCE_BROWSER_BINANCE_JSON_PARSER_H_
#define BRAVE_COMPONENTS_BINANCE_BROWSER_BINANCE_JSON_PARSER_H_

#include <string>

class BinanceJSONParser {
 public:

  static bool GetBTCValueFromAccountJSON(const std::string& json,
                                         std::string* btc_balance);
  static bool GetTickerPriceFromJSON(const std::string& json,
                                     std::string* symbol_pair_price);
};

#endif  // BRAVE_COMPONENTS_BINANCE_BROWSER_BINANCE_JSON_PARSER_H_
