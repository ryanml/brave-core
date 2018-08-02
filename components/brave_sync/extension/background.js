'use strict';

console.log("in chrome.runtime.onInstalled 001");

function dynamicallyLoadScript(url) {
  var script = document.createElement("script");
  script.src = url;
  document.head.appendChild(script);
}

chrome.runtime.onInstalled.addListener(function() {
  console.log("in chrome.runtime.onInstalled 002");
  var arg1 = 142;
  var result = chrome.braveSync.browserToWebView(arg1);
  console.log("in chrome.runtime.onInstalled 002-5 result=", result);
});

console.log("in chrome.runtime.onInstalled 003");
var theVar1 = 42;
