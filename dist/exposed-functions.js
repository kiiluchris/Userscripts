const EXTENSION_NAME = 'Comic Manager';

const savePage = async (url) => {
  let timeoutID;
  const isPageSaved = await new Promise(res => {
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
};

async function openLinks(links, isSaved) {
  if (!links.length) return false;
  const [first, ...rest] = links;
  if (!isSaved) rest.reverse();
  for (const link of rest) {
    if (isSaved) await savePage(link.href);
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
}

function openURLs([firstUrl, ...urls], isSaved = false) {
  const links = urls.map(u => ({ href: u }));
  links.unshift({
    click() {
      const link = document.createElement('a');
      link.href = firstUrl;
      isSaved && link.addEventListener('click', function (e) {
        e.preventDefault();
        window.postMessage({
          message: "replaceMonitorNovelUpdatesUrl",
          url: link.href,
          extension: EXTENSION_NAME
        });
      });
      document.body.appendChild(link);
      link.click();
    }
  });
  return openLinks(links, isSaved)
}


function getLinks({ elements, selector, filterHref, filterText, condition }) {
  if ((!selector && !elements) || (condition && !condition())) return [];
  let links = [...(selector ? document.querySelectorAll(selector) : elements)];
  if (filterHref) {
    links = links.filter(el => filterHref.test(el.href));
  }
  if (filterText) {
    links = links.filter(el => filterText.test(el.innerText));
  }
  return console.log(links) || links;
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