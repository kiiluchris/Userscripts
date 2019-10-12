import { getLinks, openLinks, openURLs } from './shared/link-open';

// ==UserScript==
// @name         General Exposed Functions
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        http*://**/*
// @grant        unsafeWindow
// @grant        GM_openInTab
// ==/UserScript==


unsafeWindow.myUserscriptUtils = {
  getLinks,
  openLinks,
  openURLs
}
const utils = unsafeWindow.myUserscriptUtils

utils.copyElToClipboard = (selector, property = 'innerText') => {
  const el = document.querySelector(selector);
  if (!el) {
    return console.error(`Element ${selector} not found`);
  }
  const input = document.createElement('input');
  input.value = el[property] || '';
  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  document.body.removeChild(input);

  return el;
};
