// ==UserScript==
// @name           Webnovel Open Boxnovel
// @namespace      http://tampermonkey.net/
// @version        0.1
// @author         You
// @description    try to take over the world!
// @match          https://www.webnovel.com/library*
// @require        https://unpkg.com/@popperjs/core@2
// @require        https://unpkg.com/tippy.js@6
// @grant          GM_openInTab
// ==/UserScript==
const compose = (f, g) => (x) => f(g(x));
const mkPrinter = (name) => (msg, ...rest) => {
    console.group(name);
    console.log(msg);
    console.log(...rest);
    console.groupEnd();
};
const printBlock = (printer, block) => {
    const messages = [];
    const print = (msg) => { messages.push(msg); };
    const result = block(print);
    messages.length > 0 && printer(...messages);
    return result;
};

Function.prototype.compose = function (fn) {
    return compose(this, fn);
};
Function.prototype.andThen = function (fn) {
    return compose(fn, this);
};

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
const mkClickableWithHref = (url) => ({
    href: url,
    click() { }
});
const mkopenURLs = (mkFirstLink, combineLinks) => ([firstUrl, ...urls], isSaved = false) => {
    const links = urls.map((u) => ({ href: u, click() { } }));
    const ls = combineLinks(mkFirstLink(firstUrl, isSaved), links);
    return openLinks(ls, isSaved);
};
const openURLsInactiveTab = mkopenURLs((url) => mkClickableWithHref(url), (first, rest) => [mkClickableWithHref(''), first, ...rest]);

(function () {
    const print = mkPrinter('Webnovel Open Boxnovel');
    const getTitle = (title) => ({
        'Experimental Log of the Crazy Lich': 'the-experimental-log-of-the-crazy-lich',
        "It's Not Easy to Be a Man After Travelling to the Future": 'crossing-to-the-future-its-not-easy-to-be-a-man',
    }[title] || title);
    const formatTitle = (title) => title.toLowerCase().replace(/['|’]/g, '').replace(/ /g, '-');
    const boxNovelUrl = (formattedTitle) => `https://boxnovel.com/novel/${formattedTitle}/`;
    const vipNovelUrl = (formattedTitle) => `https://vipnovel.com/vipnovel/${formattedTitle}/`;
    const isRequiredEvent = (e) => e.shiftKey && (e.ctrlKey || e.altKey);
    const urlFormatter = (e) => (formattedTitle) => {
        const url = e.ctrlKey
            ? boxNovelUrl(formattedTitle)
            : vipNovelUrl.compose((u) => u.replace('the-experimental', 'experimental'))(formattedTitle);
        return { url, formattedTitle };
    };
    const staticNovelUrls = (title) => (data) => {
        const staticUrls = {
            'Supreme Magus': 'https://www.wuxiaworld.co/Supreme-Magus/',
        }[title] || data.url;
        return { url: staticUrls, formattedTitle: data.formattedTitle };
    };
    const addTooltip = (el) => {
        if (!el)
            return;
        tippy(el, {
            content: el.innerHTML,
            interactive: true,
            allowHTML: true,
            size: 'large',
        });
    };
    let novelUrls = {};
    document.querySelectorAll('.m-book a').forEach((el) => {
        var _a;
        addTooltip((_a = el.nextElementSibling) === null || _a === void 0 ? void 0 : _a.nextElementSibling);
        el.addEventListener('click', (e) => {
            const title = el.getElementsByTagName('h3')[0].innerText;
            const { url, formattedTitle } = getTitle
                .andThen(formatTitle)
                .andThen(urlFormatter(e))
                .andThen(staticNovelUrls(title))(title);
            const webnovelUrl = new URL(el.href);
            webnovelUrl.searchParams.set('open-last-chapter', 'true');
            if (isRequiredEvent(e)) {
                e.preventDefault();
                print(`Opening ${formattedTitle} => ${url}`);
                novelUrls[url] = webnovelUrl.href;
            }
            else if (e.ctrlKey && e.altKey) {
                e.preventDefault();
                openURLsInactiveTab([webnovelUrl.href]);
            }
            else if (e.altKey) {
                e.preventDefault();
                openURLsInactiveTab([url]);
            }
        });
    });
    window.addEventListener('keyup', (e) => {
        if (!e.shiftKey)
            return;
        if (e.code === 'Period') {
            printBlock(print, (print) => {
                const urls = Object.keys(novelUrls).map((n) => {
                    const extUrl = new URL(n);
                    if (e.altKey) {
                        extUrl.searchParams.set('open-last-chapter', 'true');
                    }
                    return extUrl.href;
                });
                urls.length && openURLsInactiveTab(urls);
                print('Opening tabs ' + novelUrls);
            });
        }
        else if (e.code === 'Comma') {
            const urls = [...new Set(Object.values(novelUrls))];
            urls.length && openURLsInactiveTab(urls);
            novelUrls = {};
            print('Cleared {novelUrls}');
        }
        else if (e.code === 'Slash') {
            novelUrls = {};
            print('Cleared {novelUrls}');
        }
    });
}());
