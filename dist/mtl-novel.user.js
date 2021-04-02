// ==UserScript==
// @name           Mtl Novel
// @namespace      http://tampermonkey.net/
// @version        0.1
// @author         kiiluchris
// @description    try to take over the world!
// @match          https://www.novelupdates.com/series/*
// @include        /www.mtlnovel.com\/([^/]+)\//
// @grant          GM_openInTab
// @run-at         document-end
// ==/UserScript==
const cleanText = {
    "the-male-leads-villainess-stepmother": (novelText) => {
        const lastP = novelText.lastElementChild;
        lastP.innerHTML = lastP.innerHTML.replace(/The website has been changed.*/g, "");
    },
};
function pageRegex(page) {
    if (page === "novelupdates") {
        return /www.novelupdates.com\/series\/([^/?]+)/;
    }
    else {
        return /www.mtlnovel.com\/([^/]+)\//;
    }
}
function mtlNovelToc(novelName) {
    return `https://www.mtlnovel.com/${novelName}/chapter-list/`;
}
function pageUrl(page, novelName) {
    if (page === "novelupdates") {
        return mtlNovelToc(novelName);
    }
    else {
        return `https://www.novelupdates.com/series/${novelName}/`;
    }
}
function pageHook(targetPage) {
    return (page, fn) => {
        page == targetPage && fn();
    };
}
const mtlNovelHook = pageHook("mtlnovel");
(function () {
    var _a, _b;
    const page = window.location.href.startsWith("https://www.novelupdates.com/series/")
        ? "novelupdates"
        : "mtlnovel";
    const re = pageRegex(page);
    const novelName = (_a = re.exec(window.location.href)) === null || _a === void 0 ? void 0 : _a[1];
    const novelText = document.querySelector('div[class^="par fontsize-"');
    novelName && novelText && ((_b = cleanText[novelName]) === null || _b === void 0 ? void 0 : _b.call(cleanText, novelText));
    mtlNovelHook(page, () => {
        document
            .querySelectorAll(".chapter-nav a.toc")
            .forEach((el) => {
            if (novelName) {
                el.href = mtlNovelToc(novelName);
            }
        });
    });
    window.addEventListener("keyup", (e) => {
        if (e.altKey && e.key.toLowerCase() === "n" && novelName) {
            GM_openInTab(pageUrl(page, novelName), {
                active: false,
                setParent: true,
            });
        }
    });
})();
