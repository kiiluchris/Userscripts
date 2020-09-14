// ==UserScript==
// @name           Webtoons Like Comic
// @namespace      http://tampermonkey.net/
// @version        0.1.1
// @author         You
// @description    try to take over the world!
// @include        /www.webtoons.com\/en\/.+\/viewer\?title_no=\d+&episode_no=\d+/
// @grant          none
// ==/UserScript==
(() => {
    window.addEventListener('load', () => {
        setTimeout(() => {
            var _a;
            const likeButton = document.getElementById('likeItButton');
            const isLiked = ((_a = likeButton === null || likeButton === void 0 ? void 0 : likeButton.firstElementChild) === null || _a === void 0 ? void 0 : _a.classList.contains('on')) || true;
            if (!isLiked) {
                likeButton === null || likeButton === void 0 ? void 0 : likeButton.click();
            }
        }, 5000);
    });
})();
