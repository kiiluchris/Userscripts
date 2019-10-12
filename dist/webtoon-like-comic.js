// ==UserScript==
// @name         Webtoons Like Comic
// @namespace    http://tampermonkey.net/
// @version      0.1.1
// @description  try to take over the world!
// @author       You
// @include      /www.webtoons.com\/en\/.+\/viewer\?title_no=\d+&episode_no=\d+/
// @grant        none
// ==/UserScript==

(function () {

  window.addEventListener('load', () => {
    setTimeout(() => {
      const likeButton = document.getElementById('likeItButton');
      const isLiked = likeButton.firstElementChild.classList.contains('on');
      if (!isLiked) {
        likeButton.click();
      }
    }, 5000);
  });
})();
