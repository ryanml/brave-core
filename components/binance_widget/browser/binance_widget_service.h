/* Copyright (c) 2019 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef BRAVE_COMPONENTS_BINANCE_WIDGET_BROWSER_BINANCE_WIDGET_SERVICE_H_
#define BRAVE_COMPONENTS_BINANCE_WIDGET_BROWSER_BINANCE_WIDGET_SERVICE_H_

#include <memory>

#include "base/files/file_path.h"
#include "base/macros.h"
#include "base/memory/scoped_refptr.h"
#include "base/memory/weak_ptr.h"
#include "base/scoped_observer.h"
#include "components/keyed_service/core/keyed_service.h"

namespace base {
class SequencedTaskRunner;
}  // namespace base

namespace content {
class BrowserContext;
}  // namespace content

class BinanceWidgetController;
class Profile;

class BinanceWidgetService : public KeyedService {
 public:
  explicit BinanceWidgetService(content::BrowserContext* context);
  ~BinanceWidgetService() override;

  bool Init();
  BinanceWidgetController* controller() const { return controller_.get(); }

 private:
  content::BrowserContext* context_;
  std::unique_ptr<BinanceWidgetController> controller_;
  base::WeakPtrFactory<BinanceWidgetService> weak_factory_;

  DISALLOW_COPY_AND_ASSIGN(BinanceWidgetService);
};

#endif  // BRAVE_COMPONENTS_BINANCE_WIDGET_BROWSER_BINANCE_WIDGET_SERVICE_H_
