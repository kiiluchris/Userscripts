// ==UserScript==
// @name           Webnovel Open Site
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
    const addTooltip = (el) => {
        if (!el)
            return;
        tippy(el, {
            content: el.innerHTML,
            interactive: true,
            allowHTML: true,
            size: "large",
        });
    };
    const formatTitle = (title) => title.toLowerCase().replace(/['|’]/g, "").replace(/ /g, "-");
    const titleElement = (el) => el.getElementsByTagName("h3")[0];
    const elementTitle = (el) => formatTitle(titleElement(el).innerText);
    const boxNovelUrl = (formattedTitle) => `https://boxnovel.com/novel/${formattedTitle}/`;
    const vipNovelUrl = (formattedTitle) => `https://vipnovel.com/vipnovel/${formattedTitle}/`;
    const mangaBobUrl = (formattedTitle) => `https://mangabob.com/manga/${formattedTitle}/`;
    const defaultSwapperPredicate = (title) => !!title;
    const makeSwapper = (altUrls, predicate = defaultSwapperPredicate) => (title, mapper) => {
        const alt = altUrls[title];
        return predicate(alt) ? alt : mapper ? mapper(title) : title;
    };
    const swapWholeUrl = makeSwapper({
        "supreme-magus": "https://www.wuxiaworld.co/Supreme-Magus/",
    });
    const swapTitle = makeSwapper({
        "Experimental Log of the Crazy Lich": "the-experimental-log-of-the-crazy-lich",
        "It's Not Easy to Be a Man After Travelling to the Future": "crossing-to-the-future-its-not-easy-to-be-a-man",
    });
    const isComic = (el) => {
        var _a;
        return (((_a = el
            .querySelector("span._tag_sub")) === null || _a === void 0 ? void 0 : _a.innerText.toLowerCase()) === "comics");
    };
    const getUrlBuilder = (parentEl, e) => {
        if (isComic(parentEl)) {
            return mangaBobUrl;
        }
        else if (e.ctrlKey) {
            return boxNovelUrl;
        }
        else {
            return vipNovelUrl.compose((u) => u.replace("the-experimental", "experimental"));
        }
    };
    document.querySelectorAll(".m-book a").forEach((el) => {
        var _a;
        addTooltip((_a = el.nextElementSibling) === null || _a === void 0 ? void 0 : _a.nextElementSibling);
        el.addEventListener("click", (e) => {
            const formattedTitle = swapTitle(elementTitle(el));
            const buildUrl = getUrlBuilder(el, e);
            const url = swapWholeUrl(buildUrl(formattedTitle));
            const webnovelUrl = new URL(el.href);
            webnovelUrl.searchParams.set("open-last-chapter", "true");
            if (!(e.altKey || e.ctrlKey))
                return;
            e.preventDefault();
            if (e.ctrlKey && e.altKey) {
                e.preventDefault();
                openURLsInactiveTab([webnovelUrl.href]);
            }
            else {
                e.preventDefault();
                openURLsInactiveTab([url]);
            }
        });
    });
})();
