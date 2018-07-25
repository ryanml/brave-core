/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import WebTorrent from 'webtorrent'

cr.define('brave_webtorrent', function() {
  'use strict';
  function initialize () {
    console.log('brave webtorrent loaded');
    var client = new WebTorrent()
    console.log(client);
  }

  return {
    initialize: initialize,
  };
});

document.addEventListener('DOMContentLoaded', window.brave_webtorrent.initialize)
