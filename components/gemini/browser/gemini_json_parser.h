/* Copyright (c) 2020 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef BRAVE_COMPONENTS_GEMINI_BROWSER_GEMINI_JSON_PARSER_H_
#define BRAVE_COMPONENTS_GEMINI_BROWSER_GEMINI_JSON_PARSER_H_

#include <map>
#include <string>
#include <vector>

class GeminiJSONParser {
 public:
  static bool GetTokensFromJSON(const std::string& json,
                                std::string *value, std::string type);
};

#endif  // BRAVE_COMPONENTS_GEMINI_BROWSER_GEMINI_JSON_PARSER_H_
