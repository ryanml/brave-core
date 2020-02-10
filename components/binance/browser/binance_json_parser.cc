/* Copyright (c) 2019 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "brave/components/binance/browser/binance_json_parser.h"

#include "base/json/json_reader.h"

// static
bool BinanceJSONParser::GetBalanceFromAccountJSON(
    const std::string& json, std::map<std::string, std::string>* balances) {
  if (!balances) {
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
        balances->insert({asset_symbol, free_amount->GetString()});
      }
    }
  }
  return true;
}

// static
bool BinanceJSONParser::GetTickerPriceFromJSON(
    const std::string& json, std::string* symbol_pair_price) {
  if (!symbol_pair_price) {
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

  const base::Value* price = parsed_response->FindKey("price");
  if (!price || !price->is_string()) {
    return false;
  }

  *symbol_pair_price = price->GetString();
  return true;
}

bool BinanceJSONParser::GetTickerVolumeFromJSON(
    const std::string& json, std::string* symbol_pair_volume) {
  if (!symbol_pair_volume) {
    return false;
  }

  base::JSONReader::ValueWithError value_with_error =
      base::JSONReader::ReadAndReturnValueWithError(
          json, base::JSONParserOptions::JSON_PARSE_RFC);
  base::Optional<base::Value>& parsed_response = value_with_error.value;
  if (!parsed_response) {
    LOG(ERROR) << "Invalid response, could not parse JSON, JSON is: " << json;
    return false;
  }

  const base::Value* volume = parsed_response->FindKey("volume");
  if (!volume || !volume->is_string()) {
    return false;
  }

  *symbol_pair_volume = volume->GetString();
  return true;
}
