/* Copyright (c) 2019 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "brave/browser/binance_widget/binance_widget_service_factory.h"

#include "brave/components/binance_widget/browser/binance_widget_service.h"
#include "chrome/browser/profiles/incognito_helpers.h"
#include "chrome/browser/profiles/profile.h"
#include "components/keyed_service/content/browser_context_dependency_manager.h"

// static
BinanceWidgetServiceFactory* BinanceWidgetServiceFactory::GetInstance() {
  return base::Singleton<BinanceWidgetServiceFactory>::get();
}

// static
BinanceWidgetService* BinanceWidgetServiceFactory::GetForProfile(Profile* profile) {
  return static_cast<BinanceWidgetService*>(
      GetInstance()->GetServiceForBrowserContext(profile, true));
}

BinanceWidgetServiceFactory::BinanceWidgetServiceFactory()
    : BrowserContextKeyedServiceFactory(
          "BinanceWidgetService",
          BrowserContextDependencyManager::GetInstance()) {
}

BinanceWidgetServiceFactory::~BinanceWidgetServiceFactory() {
}

KeyedService* BinanceWidgetServiceFactory::BuildServiceInstanceFor(
    content::BrowserContext* context) const {
  return new BinanceWidgetService(Profile::FromBrowserContext(context));
}

content::BrowserContext* BinanceWidgetServiceFactory::GetBrowserContextToUse(
      content::BrowserContext* context) const {
  return chrome::GetBrowserContextRedirectedInIncognito(context);
}
