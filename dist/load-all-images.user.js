// ==UserScript==
// @name           Load All Images
// @namespace      http://tampermonkey.net/
// @version        0.1
// @author         You
// @description    try to take over the world!
// @grant          none
// @noframes       
// ==/UserScript==
const IMAGE_SELECTOR = 'img';
const IMAGE_ATTRIBUTE = 'data-src';
const IMAGE_LOAD_CB = (img) => {
};
const changeImageSrc = (img, value) => {
    if (value) {
        img.src = value;
    }
};
((selector, attribute, onLoad) => {
    [...document.querySelectorAll(selector)].forEach(img => {
        changeImageSrc(img, img.getAttribute(attribute));
        onLoad && img.addEventListener('load', () => onLoad(img));
    });
})(IMAGE_SELECTOR, IMAGE_ATTRIBUTE, IMAGE_LOAD_CB);
