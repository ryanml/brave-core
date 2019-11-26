/* Copyright (c) 2019 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef BRAVE_COMPONENTS_BINANCE_WIDGET_BROWSER_BINANCE_WIDGET_CONTROLLER_H_
#define BRAVE_COMPONENTS_BINANCE_WIDGET_BROWSER_BINANCE_WIDGET_CONTROLLER_H_

#include <list>
#include <memory>
#include <string>
#include <vector>

#include "base/callback_forward.h"
#include "base/containers/queue.h"
#include "base/macros.h"
#include "base/memory/scoped_refptr.h"
#include "base/memory/weak_ptr.h"
#include "base/observer_list.h"
#include "base/values.h"

namespace base {
class FilePath;
class SequencedTaskRunner;
}  // namespace base

namespace content {
class BrowserContext;
}  // namespace content

namespace network {
class SharedURLLoaderFactory;
class SimpleURLLoader;
}  // namespace network

class BinanceWidgetControllerObserver;

class BinanceWidgetController {
 public:
  explicit BinanceWidgetController(content::BrowserContext* context);
  ~BinanceWidgetController();

  using GetAccountBalanceCallback = base::OnceCallback<void(const std::string&)>;
  bool GetAccountBalance(GetAccountBalanceCallback callback);
  using ValidateAPIKeyCallback = base::OnceCallback<void(int, bool)>;
  bool ValidateAPIKey(ValidateAPIKeyCallback callback);
  bool SetAPIKey(const std::string& api_key, const std::string& secret_key);

  void AddObserver(BinanceWidgetControllerObserver* observer);
  void RemoveObserver(BinanceWidgetControllerObserver* observer);
  std::string GetBinanceTLD();

 private:
  using SimpleURLLoaderList =
      std::list<std::unique_ptr<network::SimpleURLLoader>>;

  using URLRequestCallback =
      base::OnceCallback<void(const int, const std::string&,
                              const std::map<std::string, std::string>&)>;

  base::SequencedTaskRunner* io_task_runner();
  void OnGetAccountBalance(GetAccountBalanceCallback callback,
                           const int status, const std::string& body,
                           const std::map<std::string, std::string>& headers);
  void OnValidateAPIKey(ValidateAPIKeyCallback callback,
                           const int status, const std::string& body,
                           const std::map<std::string, std::string>& headers);
  bool URLRequest(const std::string& method, const std::string& path,
                  const std::string& query_params, URLRequestCallback callback);
  bool LoadAPIKeyFromPrefs();
  void OnURLLoaderComplete(
      SimpleURLLoaderList::iterator iter,
      URLRequestCallback callback,
      const std::unique_ptr<std::string> response_body);
  bool GetBTCValueFromAccountJSON(const std::string& json,
                                  std::string& btc_balance);

  base::ObserverList<BinanceWidgetControllerObserver> observers_;

  scoped_refptr<base::SequencedTaskRunner> io_task_runner_;
  std::string api_key_;
  std::string secret_key_;

  content::BrowserContext* context_;
  scoped_refptr<network::SharedURLLoaderFactory> url_loader_factory_;
  SimpleURLLoaderList url_loaders_;

  base::WeakPtrFactory<BinanceWidgetController> weak_factory_;

  DISALLOW_COPY_AND_ASSIGN(BinanceWidgetController);
};

#endif  // BRAVE_COMPONENTS_BINANCE_WIDGET_BROWSER_BINANCE_WIDGET_CONTROLLER_H_
