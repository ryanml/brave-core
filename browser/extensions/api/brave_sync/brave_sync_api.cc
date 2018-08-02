/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "brave/browser/extensions/api/brave_sync/brave_sync_api.h"

#include "brave/common/extensions/api/brave_sync.h"

namespace extensions {
namespace api {

ExtensionFunction::ResponseAction BraveSyncBrowserToWebViewFunction::Run() {
  LOG(ERROR) << "TAGAB BraveSyncBrowserToWebViewFunction::Run";
  auto result = std::make_unique<base::Value>(43);
  return RespondNow(OneArgument(std::move(result)));
}

} // namespace api
} // namespace extensions
