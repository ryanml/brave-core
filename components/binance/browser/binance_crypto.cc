/* Copyright (c) 2019 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "brave/components/binance/browser/binance_crypto.h"

#include <iomanip>
#include <locale>

#include "crypto/hmac.h"

namespace {

template<typename T, size_t N>
std::string uint8ToHex(T (&a)[N]) {
  std::ostringstream res;
  for (size_t i = 0; i < N; i++) {
    res << std::setfill('0') << std::setw(sizeof(uint8_t) * 2)
       << std::hex << static_cast<int>(a[i]);
  }
  return res.str();
}

}  // namespace

// static
bool BinanceCrypto::GetSignatureForTotalParams(const std::string& query_string,
                                               const std::string& key,
                                               std::string* encoded_signature) {
  if (!encoded_signature) {
    return false;
  }

  // From Binance documentation:
  // A signature must be provided for most API types which is the HMAC using
  // key `secretKey` and value `totalParams` which is query string concat
  // request body.
  crypto::HMAC hmac(crypto::HMAC::SHA256);
  const size_t kSignatureSize = 32;
  if (kSignatureSize != hmac.DigestLength()) {
    LOG(ERROR) << "Signature size is not as expected for HMAC SHA256";
    return false;
  }

  uint8_t signature[kSignatureSize];
  if (!hmac.Init(key) ||
      !hmac.Sign(query_string, signature, kSignatureSize)) {
    LOG(ERROR) << "Error could not create signature for query "
                  "params for account balance";
    return false;
  }
  *encoded_signature = uint8ToHex(signature);
  return true;
}

// static
// Sanitizes a symbol or symbol pair to make sure it is only alphanumeric
std::string BinanceCrypto::SanitizeSymbol(const std::string& symbol_pair) {
  std::string sanitized_symbol_pair = symbol_pair;
  sanitized_symbol_pair.erase(
      std::remove_if(sanitized_symbol_pair.begin(),
                     sanitized_symbol_pair.end(),
                     [] (char c) {
                       return !std::isalnum(c);
                     }), sanitized_symbol_pair.end());
  return sanitized_symbol_pair;
}
