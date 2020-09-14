// ==UserScript==
// @name           Gogoanime
// @namespace      http://tampermonkey.net/
// @version        0.1
// @author         You
// @description    try to take over the world!
// @include        /gogoanime.io\/[^/]+(episode|movie)/
// @grant          none
// @noframes       
// ==/UserScript==
(function () {
    const frame = document.querySelector('#load_anime .play-video.selected iframe');
    frame && frame.scrollIntoView();
}());
