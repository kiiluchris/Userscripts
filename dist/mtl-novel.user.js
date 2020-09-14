// ==UserScript==
// @name           Mtl Novel
// @namespace      http://tampermonkey.net/
// @version        0.1
// @author         kiiluchris
// @description    try to take over the world!
// @include        /www.mtlnovel.com\/([^/]+)\//
// @grant          GM_openInTab
// @run-at         document-end
// ==/UserScript==
const cleanText = {
    'the-male-leads-villainess-stepmother': (novelText) => {
        const lastP = novelText.lastElementChild;
        lastP.innerHTML = lastP.innerHTML.replace(/The website has been changed.*/g, '');
    }
};
(function () {
    var _a, _b;
    const re = /www.mtlnovel.com\/([^/]+)\//;
    const novelName = (_a = re.exec(window.location.href)) === null || _a === void 0 ? void 0 : _a[1];
    const novelText = document.querySelector('div[class^="par fontsize-"');
    novelName && novelText && ((_b = cleanText[novelName]) === null || _b === void 0 ? void 0 : _b.call(cleanText, novelText));
    window.addEventListener('keyup', (e) => {
        if (e.altKey && e.key.toLowerCase() === 'n' && novelName) {
            GM_openInTab(`https://www.novelupdates.com/series/${novelName}/`, {
                active: false,
                setParent: true,
            });
        }
    });
})();
