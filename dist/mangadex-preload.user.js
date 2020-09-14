// ==UserScript==
// @name           Mangadex Preload
// @namespace      http://tampermonkey.net/
// @version        0.1
// @author         You
// @description    try to take over the world!
// @include        /mangadex.org\/chapter/
// @grant          none
// ==/UserScript==
(function () {
    window.addEventListener('keypress', (e) => {
        var _a;
        if (e.shiftKey && e.key === 'P') {
            (_a = document.getElementById('preload-all')) === null || _a === void 0 ? void 0 : _a.click();
        }
    });
}());
