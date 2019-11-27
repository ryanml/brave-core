/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

export const getUSDValue = (accountBTCBalance: string, btcUSDValue: string) => {
  if (!accountBTCBalance || !btcUSDValue) {
    return '0.00'
  }

  const btcUSDValueNumber = parseFloat(btcUSDValue)
  const btcBalanceNumber = parseFloat(accountBTCBalance)

  if (isNaN(btcUSDValueNumber) || isNaN(btcBalanceNumber)) {
    return '0.00'
  }

  return (btcUSDValueNumber * btcBalanceNumber).toFixed(2)
}
