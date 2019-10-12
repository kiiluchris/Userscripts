// ==UserScript==
// @name         Gogoanime
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @include      /gogoanime.io\/[^\/]+(episode|movie)/
// @grant        none
// @noframes
// ==/UserScript==

(function () {

  const frame = document.querySelector('#load_anime .play-video.selected iframe');
  frame && frame.scrollIntoView();
})();
