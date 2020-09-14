// ==UserScript==
// @name           General Exposed Functions
// @namespace      http://tampermonkey.net/
// @version        0.1
// @author         You
// @description    try to take over the world!
// @match          http*://**/*
// @grant          unsafeWindow
// @grant          GM_openInTab
// ==/UserScript==
// eslint-disable-next-line import/prefer-default-export
const EXTENSION_NAME = 'Comic Manager';

const savePage = async (url) => {
    let timeoutID;
    const isPageSaved = await new Promise((res) => {
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
            url,
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
    if (!links.length)
        return false;
    const [first, ...rest] = links;
    if (!isSaved)
        rest.reverse();
    // eslint-disable-next-line no-restricted-syntax
    for (const link of rest) {
        // eslint-disable-next-line no-await-in-loop
        if (isSaved)
            await savePage(link.href);
        else {
            GM_openInTab(link.href, {
                active: false,
                insert: true,
                setParent: true,
            });
        }
    }
    first.click();
    return true;
}
const mkopenURLs = (mkFirstLink, combineLinks) => ([firstUrl, ...urls], isSaved = false) => {
    const links = urls.map((u) => ({ href: u, click() { } }));
    const ls = combineLinks(mkFirstLink(firstUrl, isSaved), links);
    return openLinks(ls, isSaved);
};
const openURLs = mkopenURLs((url, isSaved) => ({
    href: url,
    click() {
        const link = document.createElement('a');
        link.href = url;
        isSaved && link.addEventListener('click', (e) => {
            e.preventDefault();
            window.postMessage({
                message: 'replaceMonitorNovelUpdatesUrl',
                url: link.href,
                extension: EXTENSION_NAME,
            }, '*');
        });
        document.body.appendChild(link);
        link.click();
    },
}), (first, rest) => [first, ...rest]);
function getLinks({ elements, selector, filterHref, filterText, condition, filter, onlyOnce = false, }) {
    if ((!selector && !elements) || (condition && !condition()))
        return [];
    let links = [...(selector
            ? document.querySelectorAll(selector)
            : elements)];
    if (filterHref) {
        links = links.filter((el) => filterHref.test(el.href));
    }
    if (filterText) {
        links = links.filter((el) => filterText.test(el.innerText));
    }
    if (filter) {
        links = links.filter(filter);
    }
    if (onlyOnce) {
        links = links.slice(0, 1);
    }
    console.log(links);
    return links;
}

unsafeWindow.myUserscriptUtils = {
    getLinks,
    openLinks,
    openURLs,
};
const utils = unsafeWindow.myUserscriptUtils;
const propertyAsString = (el, property) => {
    const value = el[property];
    switch (typeof value) {
        case 'string':
            return value;
        case 'number':
        case 'bigint':
            return `${value}`;
        case 'function':
        case 'symbol':
            return value.toString();
        default:
            return JSON.stringify(value);
    }
};
utils.copyElToClipboard = (selector, property = 'innerText') => {
    const el = document.querySelector(selector);
    if (!el) {
        return console.error(`Element ${selector} not found`);
    }
    const input = document.createElement('input');
    input.value = propertyAsString(el, property);
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    return el;
};
