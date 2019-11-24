/* Copyright (c) 2019 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef BRAVE_COMPONENTS_BINANCE_WIDGET_BROWSER_BINANCE_WIDGET_CONTROLLER_OBSERVER_H_
#define BRAVE_COMPONENTS_BINANCE_WIDGET_BROWSER_BINANCE_WIDGET_CONTROLLER_OBSERVER_H_

#include "base/observer_list_types.h"

class BinanceWidgetControllerObserver : public base::CheckedObserver {
 public:
  virtual void OnGetAccountBalance() = 0;

 protected:
  ~BinanceWidgetControllerObserver() override {}
};

#endif  // BRAVE_COMPONENTS_BINANCE_WIDGET_BROWSER_BINANCE_WIDGET_CONTROLLER_OBSERVER_H_
