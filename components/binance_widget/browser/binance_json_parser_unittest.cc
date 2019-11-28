/* Copyright (c) 2019 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "brave/components/binance_widget/browser/binance_json_parser.h"

#include "brave/components/content_settings/core/common/content_settings_util.h"
#include "chrome/test/base/chrome_render_view_host_test_harness.h"

namespace {

typedef testing::Test BinanceJSONParserTest;

TEST_F(BinanceJSONParserTest, GetBTCValueFromAccountJSON) {
  std::string btc_balance;
  ASSERT_TRUE(BinanceJSONParser::GetBTCValueFromAccountJSON(R"(
      {
        "updateTime":1574721698570,
        "accountType":"SPOT",
        "balances":[{
          "asset":"BTC",
          "free":"0.01382621",
          "locked":"0.00000000"
        }, {
          "asset":"LTC",
          "free":"0.00000000",
          "locked":"0.00000000"
        }]
      })", &btc_balance));
  ASSERT_EQ(btc_balance, "0.01382621");
}

TEST_F(BinanceJSONParserTest, GetBTCValueFromAccountJSONNoAssets) {
  std::string btc_balance;
  ASSERT_TRUE(BinanceJSONParser::GetBTCValueFromAccountJSON(R"(
      {
        "updateTime":1574721698570,
        "accountType":"SPOT",
        "balances":[]
      })", &btc_balance));
  ASSERT_EQ(btc_balance, "0");
}

TEST_F(BinanceJSONParserTest, GetBTCValueFromAccountJSONINvalidData) {
  std::string btc_balance;
  ASSERT_FALSE(BinanceJSONParser::GetBTCValueFromAccountJSON("unexpected",
                                                             &btc_balance));
}

TEST_F(BinanceJSONParserTest, GetTickerPriceFromJSON) {
  std::string symbol_pair_price;
  ASSERT_TRUE(BinanceJSONParser::GetTickerPriceFromJSON(R"(
      {
        "symbol": "BTCUSDT",
        "price": "7137.98000000"
      })", &symbol_pair_price));
  ASSERT_EQ(symbol_pair_price, "7137.98000000");
}

TEST_F(BinanceJSONParserTest, GetTickerPriceFromJSONInvalidData) {
  std::string symbol_pair_price;
  ASSERT_FALSE(BinanceJSONParser::GetTickerPriceFromJSON("unexpected",
                                                         &symbol_pair_price));
}

}  // namespace
