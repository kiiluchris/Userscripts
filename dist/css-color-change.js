// ==UserScript==
// @name         CSS Color Change
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        http*://**/*
// @noframes
// @grant        none
// ==/UserScript==e

(function () {

  const rules = [{
    re: [
      /kurokurori\.wordpress\.com\/20\d{2}\/\d{2}\/\d{2}\/[^\/]*ch(apter)?/,
      /weebsnoveltranslation.wordpress.com\/20\d{2}\/\d{2}\/\d{2}\/[^\/]*ch(apter)?/,
      /rhextranslations\.com\/.+-chapter-(?:.(?!ann\/?$))+$/,
      /thedecktranslations.wordpress.com\/20\d{2}\/\d{2}\/\d{2}/,
      /bananachocolatecosmos.wordpress.com\/[^\/]+-chapter/
    ],
    style: `\
          p {
              color: #efefef;
          }
      `
  }];
  const rule = rules.find(({ re }) => (
    re.some(r => r.test(window.location.href))
  ));
  if (!rule) return

  const stylesheet = document.createElement('style');
  stylesheet.innerHTML = rule.style;
  document.head.appendChild(stylesheet);
})();
