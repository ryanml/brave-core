/* Copyright (c) 2019 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "brave/components/binance/browser/binance_json_parser.h"

#include "brave/components/content_settings/core/common/content_settings_util.h"
#include "chrome/test/base/chrome_render_view_host_test_harness.h"

namespace {

std::string GetBalanceFromAsset(std::map<std::string, std::string>& balances,
    const std::string& asset) {
  std::string balance;
  std::map<std::string, std::string>::const_iterator it =
      balances.find(asset);
  if (it != balances.end()) {
    balance = it->second;
  }
  return balance;
}

typedef testing::Test BinanceJSONParserTest;

TEST_F(BinanceJSONParserTest, GetBalanceFromAccountJSON) {
  std::map<std::string, std::string> balances;
  ASSERT_TRUE(BinanceJSONParser::GetBalanceFromAccountJSON(R"(
      {
        "updateTime":1574721698570,
        "accountType":"SPOT",
        "balances":[{
          "asset":"BTC",
          "free":"0.01382621",
          "locked":"0.00000000"
        }, {
          "asset":"LTC",
          "free":"0.15000000",
          "locked":"0.00000000"
        }]
      })", &balances));

  std::string btc_balance = GetBalanceFromAsset(balances, "BTC");
  std::string ltc_balance = GetBalanceFromAsset(balances, "LTC");
  ASSERT_EQ(btc_balance, "0.01382621");
  ASSERT_EQ(ltc_balance, "0.15000000");
}

TEST_F(BinanceJSONParserTest, GetBalanceFromAccountJSONNoAssets) {
  std::map<std::string, std::string> balances;
  ASSERT_TRUE(BinanceJSONParser::GetBalanceFromAccountJSON(R"(
      {
        "updateTime":1574721698570,
        "accountType":"SPOT",
        "balances":[]
      })", &balances));
  ASSERT_TRUE(balances.empty());
}

TEST_F(BinanceJSONParserTest, GetBalanceFromAccountJSONINvalidData) {
  std::map<std::string, std::string> balances;
  ASSERT_FALSE(BinanceJSONParser::GetBalanceFromAccountJSON(
        "unexpected", &balances));
  ASSERT_TRUE(balances.empty());
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
