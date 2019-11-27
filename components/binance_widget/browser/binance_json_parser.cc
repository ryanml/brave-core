/* Copyright (c) 2019 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "brave/components/binance_widget/browser/binance_json_parser.h"

#include "base/json/json_reader.h"

// static
bool BinanceJSONParser::GetBTCValueFromAccountJSON(
    const std::string& json, std::string* btc_balance) {
  if (!btc_balance) {
    return false;
  }
  // Response looks like this:
  // {
  //   "makerCommission":10,
  //    ...
  //   "balances":[
  //     {"asset":"BTC", "free":"0.01382621", "locked":"0.00000000"},
  //     {"asset":"LTC","free":"0.00000000","locked":"0.00000000"},
  //     {"asset":"ETH","free":"0.00000000","locked":"0.00000000"},
  //     ...
  //   ]
  // }
  *btc_balance = "0";
  base::JSONReader::ValueWithError value_with_error =
      base::JSONReader::ReadAndReturnValueWithError(
          json, base::JSONParserOptions::JSON_PARSE_RFC);
  base::Optional<base::Value>& records_v = value_with_error.value;
  if (!records_v) {
    LOG(ERROR) << "Invalid response, could not parse JSON, JSON is: " << json;
    return false;
  }

  const base::Value* pv_arr = records_v->FindKey("balances");
  if (pv_arr && pv_arr->is_list()) {
    for (const base::Value &val : pv_arr->GetList()) {
      const base::Value* asset = val.FindKey("asset");
      const base::Value* free_amount = val.FindKey("free");
      const base::Value* locked_amount = val.FindKey("locked");
      if (asset && asset->is_string() &&
          free_amount && free_amount->is_string() &&
          locked_amount && locked_amount->is_string()) {
        std::string asset_symbol = asset->GetString();
        if (asset_symbol == "BTC") {
          *btc_balance = free_amount->GetString();
        }
      }
    }
  }
  return true;
}

// static
bool BinanceJSONParser::GetBTCUSDValueFromJSON(
    const std::string& json, std::string* btc_usd_value) {
  if (!btc_usd_value) {
    return false;
  }
  // Response format:
  // {
  //   "symbol": "BTCUSDT",
  //   "price": "7137.98000000"
  // }
  base::JSONReader::ValueWithError value_with_error =
      base::JSONReader::ReadAndReturnValueWithError(
          json, base::JSONParserOptions::JSON_PARSE_RFC);
  base::Optional<base::Value>& parsed_response = value_with_error.value;
  if (!parsed_response) {
    LOG(ERROR) << "Invalid response, could not parse JSON, JSON is: " << json;
    return false;
  }

  const base::Value* btc_price = parsed_response->FindKey("price");
  if (!btc_price || !btc_price->is_string()) {
    return false;
  }

  *btc_usd_value = btc_price->GetString();
  return true;
}
