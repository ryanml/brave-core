/* Copyright (c) 2019 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "brave/components/binance_widget/browser/binance_crypto.h"

#include "chrome/test/base/chrome_render_view_host_test_harness.h"

namespace {

typedef testing::Test BinanceCryptoTest;

TEST_F(BinanceCryptoTest, GetSignatureForTotalParams) {
  std::string encoded_signature;
  ASSERT_TRUE(BinanceCrypto::GetSignatureForTotalParams("c=d&foo=bar&pi=3.14",
        "def", &encoded_signature));
  ASSERT_EQ(encoded_signature,
            "77f3f2f777022dbd6b967ead15b593e0f0d65db248d2735b0aea644b84ffc7a5");
  ASSERT_TRUE(BinanceCrypto::GetSignatureForTotalParams("c=d&foo=bar&pi=3.14",
        "diff-key", &encoded_signature));
  ASSERT_EQ(encoded_signature,
            "859a0f47520af49464e051558638599b12e9f7e6eaff6e90879313567b962ba4");
  ASSERT_TRUE(BinanceCrypto::GetSignatureForTotalParams("diff=params",
        "def", &encoded_signature));
  ASSERT_EQ(encoded_signature,
            "7728b5c221422d0a7f144f8bd86fcf21d1fa4c60947d3c7b576a4845fde33053");
  ASSERT_FALSE(BinanceCrypto::GetSignatureForTotalParams("a=b", "def",
                                                         nullptr));
}

TEST_F(BinanceCryptoTest, SanitizeSymbol) {
  ASSERT_EQ(BinanceCrypto::SanitizeSymbol("BTCUSDT&intention=bad"),
            "BTCUSDTintentionbad");
}

}  // namespace
