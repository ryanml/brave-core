/* Copyright (c) 2019 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef BRAVE_COMPONENTS_BINANCE_WIDGET_BROWSER_BINANCE_CRYPTO_H_
#define BRAVE_COMPONENTS_BINANCE_WIDGET_BROWSER_BINANCE_CRYPTO_H_

#include <string>

class BinanceCrypto {
 public:
  static bool GetSignatureForTotalParams(const std::string& params,
                                         const std::string& key,
                                         std::string* encoded_signature);
  static std::string SanitizeSymbol(const std::string& symbol);
};

#endif  // BRAVE_COMPONENTS_BINANCE_WIDGET_BROWSER_BINANCE_CRYPTO_H_
