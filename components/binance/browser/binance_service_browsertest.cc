/* Copyright (c) 2019 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "base/path_service.h"
#include "base/scoped_observer.h"
#include "brave/browser/binance/binance_service_factory.h"
#include "brave/common/brave_paths.h"
#include "brave/common/pref_names.h"
#include "brave/components/binance/browser/binance_controller.h"
#include "brave/components/binance/browser/binance_service.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/browser.h"
#include "chrome/test/base/in_process_browser_test.h"
#include "chrome/test/base/ui_test_utils.h"
#include "components/country_codes/country_codes.h"
#include "components/prefs/pref_service.h"
#include "content/public/test/browser_test_utils.h"
#include "net/dns/mock_host_resolver.h"
#include "net/test/embedded_test_server/http_request.h"
#include "net/test/embedded_test_server/http_response.h"

namespace {

std::unique_ptr<net::test_server::HttpResponse> HandleRequest(
    const net::test_server::HttpRequest& request) {
  std::unique_ptr<net::test_server::BasicHttpResponse> http_response(
      new net::test_server::BasicHttpResponse());
  http_response->set_code(net::HTTP_OK);
  http_response->set_content_type("text/html");
  std::string request_path = request.GetURL().path();
  LOG(ERROR) << "Request_path: " << request_path;
  if (request_path == "/v3/account") {
    http_response->set_content(R"({
        "updateTime":1574721698570,
        "accountType":"SPOT",
        "balances":[{
          "asset":"BTC",
          "free":"0.01382621",
          "locked":"0.00000000"
        }, {
          "asset":"LTC",
          "free":"0.00000000",
          "locked":"0.00000000"
        }]})");
  } else if (request_path == "/v3/ticker/price") {
    http_response->set_content(R"({
        "symbol": "BTCUSDT",
        "price": "7137.98000000"
      })");
  }
  return std::move(http_response);
}

std::unique_ptr<net::test_server::HttpResponse> HandleRequestUnauthorized(
    const net::test_server::HttpRequest& request) {
  std::unique_ptr<net::test_server::BasicHttpResponse> http_response(
      new net::test_server::BasicHttpResponse());
  http_response->set_content_type("text/html");
  http_response->set_code(net::HTTP_UNAUTHORIZED);
  return std::move(http_response);
}

std::unique_ptr<net::test_server::HttpResponse> HandleRequestServerError(
    const net::test_server::HttpRequest& request) {
  std::unique_ptr<net::test_server::BasicHttpResponse> http_response(
      new net::test_server::BasicHttpResponse());
  http_response->set_content_type("text/html");
  http_response->set_code(net::HTTP_INTERNAL_SERVER_ERROR);
  return std::move(http_response);
}

}  // namespace

class BinanceAPIBrowserTest : public InProcessBrowserTest {
 public:
  BinanceAPIBrowserTest() : expected_status_code_(-1),
      expected_unauthorized_(false) {
  }

  void SetUpOnMainThread() override {
    InProcessBrowserTest::SetUpOnMainThread();
    host_resolver()->AddRule("*", "127.0.0.1");

    ResetHTTPSServer(base::BindRepeating(&HandleRequest));

    brave::RegisterPathProvider();
    base::FilePath test_data_dir;
    base::PathService::Get(brave::DIR_TEST_DATA, &test_data_dir);
  }

  ~BinanceAPIBrowserTest() override {
  }

  content::WebContents* contents() {
    return browser()->tab_strip_model()->GetActiveWebContents();
  }

  void ResetHTTPSServer(
      const net::EmbeddedTestServer::HandleRequestCallback& callback) {
    https_server_.reset(new net::EmbeddedTestServer(
        net::test_server::EmbeddedTestServer::TYPE_HTTPS));
    https_server_->SetSSLConfig(net::EmbeddedTestServer::CERT_OK);
    https_server_->RegisterRequestHandler(callback);
    ASSERT_TRUE(https_server_->Start());
    BinanceController::SetAPIEndPointForTest(
        https_server_->base_url().spec());
  }

  void WaitForValidateAPIKey(int expected_status_code,
                             bool expected_unauthorized) {
    if (wait_for_validate_api_key_) {
      return;
    }
    expected_status_code_ = expected_status_code;
    expected_unauthorized_ = expected_unauthorized;
    wait_for_validate_api_key_.reset(new base::RunLoop);
    wait_for_validate_api_key_->Run();
  }

  void WaitForGetAccountBalance(const std::string& btc_balance, int status,
                                bool unauthorized) {
    if (wait_for_get_account_balance_) {
      return;
    }
    expected_btc_balance_ = btc_balance;
    expected_status_code_ = status;
    expected_unauthorized_ = unauthorized;
    wait_for_get_account_balance_.reset(new base::RunLoop);
    wait_for_get_account_balance_->Run();
  }

  void WaitForGetTickerPrice(const std::string& symbol_pair_price) {
    if (wait_for_get_ticker_price_) {
      return;
    }
    expected_symbol_pair_price_ = symbol_pair_price;
    wait_for_get_ticker_price_.reset(new base::RunLoop);
    wait_for_get_ticker_price_->Run();
  }

  void WaitForChromeAPIAccountBalance() {
    std::string msg_from_renderer;
    std::string script = R"(
      (function() {
        chrome.binance.setAPIKey('abc', 'def')
        chrome.binance.validateAPIKey((status, unauthorized) => {
          if (status != 200) {
            window.domAutomationController.send('error-1')
            return
          }
          if (unauthorized) {
            window.domAutomationController.send('error-2')
            return
          }
          chrome.binance.getAccountBalance((btc_balance, unauthorized) => {
            if (unauthorized) {
              window.domAutomationController.send('error-3')
              return
            } else if (btc_balance != '0.01382621') {
              window.domAutomationController.send('error-4')
              return
            }
            window.domAutomationController.send('success')
          })
        })
      })()
      )";
    ASSERT_TRUE(ExecuteScriptAndExtractString(
        contents(), script, &msg_from_renderer));
    ASSERT_EQ(msg_from_renderer, "success");
  }

  void WaitForChromeAPIAccountBalanceAssetUnauthorized() {
    std::string msg_from_renderer;
    std::string script = R"(
      (function() {
        chrome.binance.getAccountBalance((btc_balance, unauthorized) => {
          if (!unauthorized) {
            window.domAutomationController.send('error-3')
            return
          }
          window.domAutomationController.send('success')
        })
      })()
      )";
    ASSERT_TRUE(ExecuteScriptAndExtractString(
        contents(), script, &msg_from_renderer));
    ASSERT_EQ(msg_from_renderer, "success");
  }

  void WaitForChromeAPIAccountBalanceAssetServerError() {
    std::string msg_from_renderer;
    std::string script = R"(
      (function() {
        chrome.binance.getAccountBalance((btc_balance, unauthorized) => {
          if (unauthorized) {
            window.domAutomationController.send('error-3')
            return
          }
          window.domAutomationController.send('success')
        })
      })()
      )";
    ASSERT_TRUE(ExecuteScriptAndExtractString(
        contents(), script, &msg_from_renderer));
    ASSERT_EQ(msg_from_renderer, "success");
  }

  void WaitForChromeAPIUnauthorized() {
    std::string msg_from_renderer;
    std::string script = R"(
      (function() {
        chrome.binance.setAPIKey('abc', 'def')
        chrome.binance.validateAPIKey((status, unauthorized) => {
          if (status == 401 && unauthorized) {
            window.domAutomationController.send('success')
            return
          }
          window.domAutomationController.send('error-1')
          return
        })
      })()
      )";
    ASSERT_TRUE(ExecuteScriptAndExtractString(
        contents(), script, &msg_from_renderer));
    ASSERT_EQ(msg_from_renderer, "success");
  }

    void WaitForChromeAPIServerError() {
    std::string msg_from_renderer;
    std::string script = R"(
      (function() {
        chrome.binance.setAPIKey('abc', 'def')
        chrome.binance.validateAPIKey((status, unauthorized) => {
          if (status == 500 && !unauthorized) {
            window.domAutomationController.send('success')
            return
          }
          window.domAutomationController.send('error-1')
          return
        })
      })()
      )";
    ASSERT_TRUE(ExecuteScriptAndExtractString(
        contents(), script, &msg_from_renderer));
    ASSERT_EQ(msg_from_renderer, "success");
  }

  void OnValidateAPIKey(int status_code, bool unauthorized) {
    if (wait_for_validate_api_key_) {
      wait_for_validate_api_key_->Quit();
    }
    ASSERT_EQ(expected_status_code_, status_code);
    ASSERT_EQ(expected_unauthorized_, unauthorized);
  }

  void OnGetAccountBalance(const std::map<std::string, std::string>& balances,
                           int status, bool unauthorized) {
    if (wait_for_get_account_balance_) {
      wait_for_get_account_balance_->Quit();
    }
    std::string btc_balance = "-";
    std::map<std::string, std::string>::const_iterator it =
        balances.find("BTC");
    if (it != balances.end()) {
      btc_balance = it->second;
    }
    ASSERT_EQ(expected_btc_balance_, btc_balance);
    ASSERT_EQ(expected_status_code_, status);
    ASSERT_EQ(expected_unauthorized_, unauthorized);
  }

  void OnGetTickerPrice(const std::string& ticker_price) {
    if (wait_for_get_ticker_price_) {
      wait_for_get_ticker_price_->Quit();
    }
    ASSERT_EQ(expected_symbol_pair_price_, ticker_price);
  }

  content::WebContents* active_contents() {
    return browser()->tab_strip_model()->GetActiveWebContents();
  }

  bool NavigateToNewTabUntilLoadStop() {
    ui_test_utils::NavigateToURL(browser(), GURL("chrome://newtab"));
    return WaitForLoadStop(active_contents());
  }

  BinanceController* GetBinanceController() {
    return BinanceServiceFactory::GetInstance()
        ->GetForProfile(Profile::FromBrowserContext(browser()->profile()))
        ->controller();
  }

 private:
  net::EmbeddedTestServer* https_server() { return https_server_.get(); }

  int expected_status_code_;
  bool expected_unauthorized_;
  std::string expected_btc_balance_;
  std::string expected_symbol_pair_price_;

  std::unique_ptr<base::RunLoop> wait_for_validate_api_key_;
  std::unique_ptr<base::RunLoop> wait_for_get_account_balance_;
  std::unique_ptr<base::RunLoop> wait_for_get_ticker_price_;
  std::unique_ptr<net::EmbeddedTestServer> https_server_;
};

IN_PROC_BROWSER_TEST_F(BinanceAPIBrowserTest, PRE_SetAPIKey) {
  EXPECT_TRUE(NavigateToNewTabUntilLoadStop());
  auto* controller = GetBinanceController();
  ASSERT_TRUE(controller);
  ASSERT_TRUE(controller->SetAPIKey("abc", "def"));
}

IN_PROC_BROWSER_TEST_F(BinanceAPIBrowserTest, SetAPIKey) {
  auto* controller = GetBinanceController();
  ASSERT_TRUE(controller);
  ASSERT_EQ(controller->api_key_, "abc");
  ASSERT_EQ(controller->secret_key_, "def");
}

IN_PROC_BROWSER_TEST_F(BinanceAPIBrowserTest, ValidateAPIKey) {
  EXPECT_TRUE(NavigateToNewTabUntilLoadStop());
  auto* controller = GetBinanceController();
  ASSERT_TRUE(controller);
  ASSERT_TRUE(controller->SetAPIKey("abc", "def"));
  ASSERT_TRUE(controller->ValidateAPIKey(
      base::BindOnce(
          &BinanceAPIBrowserTest::OnValidateAPIKey,
          base::Unretained(this))));
  WaitForValidateAPIKey(200, false);
}

IN_PROC_BROWSER_TEST_F(BinanceAPIBrowserTest,
    ValidateAPIKeyUnauthorized) {
  ResetHTTPSServer(base::BindRepeating(&HandleRequestUnauthorized));
  EXPECT_TRUE(NavigateToNewTabUntilLoadStop());
  auto* controller = GetBinanceController();
  ASSERT_TRUE(controller);
  ASSERT_TRUE(controller->SetAPIKey("abc", "def"));
  ASSERT_TRUE(controller->ValidateAPIKey(
      base::BindOnce(
          &BinanceAPIBrowserTest::OnValidateAPIKey,
          base::Unretained(this))));
  WaitForValidateAPIKey(401, true);
}

IN_PROC_BROWSER_TEST_F(BinanceAPIBrowserTest,
    ValidateAPIKeyOtherNetworkError) {
  ResetHTTPSServer(base::BindRepeating(&HandleRequestServerError));
  EXPECT_TRUE(NavigateToNewTabUntilLoadStop());
  auto* controller = GetBinanceController();
  ASSERT_TRUE(controller);
  ASSERT_TRUE(controller->SetAPIKey("abc", "def"));
  ASSERT_TRUE(controller->ValidateAPIKey(
      base::BindOnce(
          &BinanceAPIBrowserTest::OnValidateAPIKey,
          base::Unretained(this))));
  WaitForValidateAPIKey(500, false);
}

IN_PROC_BROWSER_TEST_F(BinanceAPIBrowserTest, GetAccountBalance) {
  EXPECT_FALSE(BinanceController::IsPublicEndpoint(api_path_account));
  EXPECT_TRUE(NavigateToNewTabUntilLoadStop());
  auto* controller = GetBinanceController();
  ASSERT_TRUE(controller);
  ASSERT_TRUE(controller->SetAPIKey("abc", "def"));
  ASSERT_TRUE(controller->GetAccountBalance(
      base::BindOnce(
          &BinanceAPIBrowserTest::OnGetAccountBalance,
          base::Unretained(this))));
  WaitForGetAccountBalance("0.01382621", 200, false);
}

IN_PROC_BROWSER_TEST_F(BinanceAPIBrowserTest,
    GetAccountBalanceUnauthorized) {
  ResetHTTPSServer(base::BindRepeating(&HandleRequestUnauthorized));
  EXPECT_TRUE(NavigateToNewTabUntilLoadStop());
  auto* controller = GetBinanceController();
  ASSERT_TRUE(controller);
  ASSERT_TRUE(controller->SetAPIKey("abc", "def"));
  ASSERT_TRUE(controller->GetAccountBalance(
      base::BindOnce(
          &BinanceAPIBrowserTest::OnGetAccountBalance,
          base::Unretained(this))));
  WaitForGetAccountBalance("-", 401, true);
}

IN_PROC_BROWSER_TEST_F(BinanceAPIBrowserTest,
    GetAccountBalanceOtherNetworkError) {
  ResetHTTPSServer(base::BindRepeating(&HandleRequestServerError));
  EXPECT_TRUE(NavigateToNewTabUntilLoadStop());
  auto* controller = GetBinanceController();
  ASSERT_TRUE(controller);
  ASSERT_TRUE(controller->SetAPIKey("abc", "def"));
  ASSERT_TRUE(controller->GetAccountBalance(
      base::BindOnce(
          &BinanceAPIBrowserTest::OnGetAccountBalance,
          base::Unretained(this))));
  WaitForGetAccountBalance("-", 500, false);
}

IN_PROC_BROWSER_TEST_F(BinanceAPIBrowserTest, GetBinanceTLD) {
  ResetHTTPSServer(base::BindRepeating(&HandleRequestServerError));
  EXPECT_TRUE(NavigateToNewTabUntilLoadStop());
  const std::string usCode = "US";
  const std::string canadaCode = "CA";
  const int32_t us_id = country_codes::CountryCharsToCountryID(
    usCode.at(0), usCode.at(1));
  const int32_t canada_id = country_codes::CountryCharsToCountryID(
    canadaCode.at(0), canadaCode.at(1));

  auto* controller = GetBinanceController();
  ASSERT_TRUE(controller);

  browser()->profile()->GetPrefs()->SetInteger(
      country_codes::kCountryIDAtInstall, us_id);
  ASSERT_EQ(controller->GetBinanceTLD(), "us");

  browser()->profile()->GetPrefs()->SetInteger(
      country_codes::kCountryIDAtInstall, canada_id);
  ASSERT_EQ(controller->GetBinanceTLD(), "com");
}

IN_PROC_BROWSER_TEST_F(BinanceAPIBrowserTest,
    GetTickerPrice) {
  EXPECT_TRUE(BinanceController::IsPublicEndpoint(
          api_path_ticker_price));
  EXPECT_TRUE(NavigateToNewTabUntilLoadStop());
  auto* controller = GetBinanceController();
  ASSERT_TRUE(controller);
  ASSERT_TRUE(controller->SetAPIKey("abc", "def"));
  ASSERT_TRUE(controller->GetTickerPrice(
      "BTCUSDT",
      base::BindOnce(
          &BinanceAPIBrowserTest::OnGetTickerPrice,
          base::Unretained(this))));
  WaitForGetTickerPrice("7137.98000000");
}

IN_PROC_BROWSER_TEST_F(BinanceAPIBrowserTest,
    GetTickerPriceUnauthorized) {
  ResetHTTPSServer(base::BindRepeating(&HandleRequestUnauthorized));
  EXPECT_TRUE(NavigateToNewTabUntilLoadStop());
  auto* controller = GetBinanceController();
  ASSERT_TRUE(controller);
  ASSERT_TRUE(controller->SetAPIKey("abc", "def"));
  ASSERT_TRUE(controller->GetTickerPrice(
      "BTCUSDT",
      base::BindOnce(
          &BinanceAPIBrowserTest::OnGetTickerPrice,
          base::Unretained(this))));
  WaitForGetTickerPrice("0.00");
}

IN_PROC_BROWSER_TEST_F(BinanceAPIBrowserTest,
    GetTickerPriceServerError) {
  ResetHTTPSServer(base::BindRepeating(&HandleRequestServerError));
  EXPECT_TRUE(NavigateToNewTabUntilLoadStop());
  auto* controller = GetBinanceController();
  ASSERT_TRUE(controller);
  ASSERT_TRUE(controller->SetAPIKey("abc", "def"));
  ASSERT_TRUE(controller->GetTickerPrice(
      "BTCUSDT",
      base::BindOnce(
          &BinanceAPIBrowserTest::OnGetTickerPrice,
          base::Unretained(this))));
  WaitForGetTickerPrice("0.00");
}

IN_PROC_BROWSER_TEST_F(BinanceAPIBrowserTest,
    ChromeAPIAccountBalance) {
  ASSERT_TRUE(NavigateToNewTabUntilLoadStop());
  WaitForChromeAPIAccountBalance();
}

IN_PROC_BROWSER_TEST_F(BinanceAPIBrowserTest,
    ChromeAPIAccountBalanceUnauthorized) {
  ASSERT_TRUE(NavigateToNewTabUntilLoadStop());
  // First we setup the API info correctly, then we wait for an error
  WaitForChromeAPIAccountBalance();
  ResetHTTPSServer(base::BindRepeating(&HandleRequestUnauthorized));
  WaitForChromeAPIAccountBalanceAssetUnauthorized();
}

IN_PROC_BROWSER_TEST_F(BinanceAPIBrowserTest,
    ChromeAPIAccountBalanceServerError) {
  ASSERT_TRUE(NavigateToNewTabUntilLoadStop());
  // First we setup the API info correctly, then we wait for an error
  WaitForChromeAPIAccountBalance();
  ResetHTTPSServer(base::BindRepeating(&HandleRequestServerError));
  WaitForChromeAPIAccountBalanceAssetServerError();
}

IN_PROC_BROWSER_TEST_F(BinanceAPIBrowserTest,
    ChromeAPIUnauthorized) {
  ResetHTTPSServer(base::BindRepeating(&HandleRequestUnauthorized));
  ASSERT_TRUE(NavigateToNewTabUntilLoadStop());
  WaitForChromeAPIUnauthorized();
}

IN_PROC_BROWSER_TEST_F(BinanceAPIBrowserTest,
    ChromeAPIServerError) {
  ResetHTTPSServer(base::BindRepeating(&HandleRequestServerError));
  ASSERT_TRUE(NavigateToNewTabUntilLoadStop());
  WaitForChromeAPIServerError();
}
