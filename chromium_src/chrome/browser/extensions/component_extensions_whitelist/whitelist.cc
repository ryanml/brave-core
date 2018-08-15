/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#define IsComponentExtensionWhitelisted IsComponentExtensionWhitelisted_ChromiumImpl
#include "../../../../../../chrome/browser/extensions/component_extensions_whitelist/whitelist.cc"
#undef IsComponentExtensionWhitelisted

#include "components/grit/brave_components_resources.h"
#include "brave/components/brave_sync/grit/brave_sync_resources.h"

namespace extensions {

bool IsComponentExtensionWhitelisted(const std::string& extension_id) {
  const char* const kAllowed[] = {
    "mnojpmjdmbbfmejpflffifhffcmidifd",
    "nomlkjnggnifocmealianaaiobmebgil"
  };

  for (size_t i = 0; i < arraysize(kAllowed); ++i) {
    if (extension_id == kAllowed[i])
      return true;
  }

  return IsComponentExtensionWhitelisted_ChromiumImpl(extension_id);
}

bool IsComponentExtensionWhitelisted(int manifest_resource_id) {
  switch (manifest_resource_id) {
    // Please keep the list in alphabetical order.
    case IDR_BRAVE_EXTENSON:
    case IDR_BRAVE_SYNC_EXTENSION:
      return true;
  }

  return IsComponentExtensionWhitelisted_ChromiumImpl(manifest_resource_id);
}

}  // namespace extensions
