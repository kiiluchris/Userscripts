/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

const EXTENSION_NAME = 'Comic Manager';

const savePage = (url) => __awaiter(void 0, void 0, void 0, function* () {
    let timeoutID;
    const isPageSaved = yield new Promise(res => {
        const extension = EXTENSION_NAME;
        const listenForMessageConfirm = ({ data: { message, extensionName } }) => {
            if (extension === extensionName && `Saved: ${url}` === message) {
                window.removeEventListener('message', listenForMessageConfirm);
                clearTimeout(timeoutID);
                res(true);
            }
        };
        window.postMessage({
            extension,
            message: 'novelUpdatesSaveUrl',
            url
        }, window.location.href);
        window.addEventListener('message', listenForMessageConfirm);
        timeoutID = setTimeout(() => {
            window.removeEventListener('message', listenForMessageConfirm);
            res(false);
        }, 5000);
    });
    if (!isPageSaved) {
        throw new Error(`Save page failed: URL ${url} not saved`);
    }
});

function openLinks(links, isSaved) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!links.length)
            return false;
        const [first, ...rest] = links;
        if (!isSaved)
            rest.reverse();
        for (const link of rest) {
            if (isSaved)
                yield savePage(link.href);
            else {
                GM_openInTab(link.href, {
                    active: false,
                    insert: true,
                    setParent: true
                });
            }
        }
        first.click();
        return true;
    });
}
function openURLs([firstUrl, ...urls], isSaved = false) {
    const links = urls.map(u => ({ href: u, click() { } }));
    links.unshift({
        href: firstUrl,
        click() {
            const link = document.createElement('a');
            link.href = firstUrl;
            isSaved && link.addEventListener('click', function (e) {
                e.preventDefault();
                window.postMessage({
                    message: "replaceMonitorNovelUpdatesUrl",
                    url: link.href,
                    extension: EXTENSION_NAME
                }, "*");
            });
            document.body.appendChild(link);
            link.click();
        }
    });
    return openLinks(links, isSaved);
}
function getLinks({ elements, selector, filterHref, filterText, condition }) {
    if ((!selector && !elements) || (condition && !condition()))
        return [];
    let links = [...(selector ? document.querySelectorAll(selector) : elements)];
    if (filterHref) {
        links = links.filter(el => filterHref.test(el.href));
    }
    if (filterText) {
        links = links.filter(el => filterText.test(el.innerText));
    }
    console.log(links);
    return links;
}

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
};
const utils = unsafeWindow.myUserscriptUtils;

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
