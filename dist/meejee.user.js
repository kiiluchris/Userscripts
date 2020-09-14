// ==UserScript==
// @name           Flatten Meejee Code Section
// @namespace      http://tampermonkey.net/
// @version        0.1
// @author         You
// @description    try to take over the world!
// @include        /www\.meejee\.net\/read\.html\?book=\d+&chapter=\d+/
// @grant          none
// ==/UserScript==
(function () {
    setTimeout(() => {
        const codeSections = [...document.getElementsByTagName('code')];
        console.log('Code Sections', codeSections);
        codeSections.forEach((el) => {
            el.outerHTML = el.innerText
                .replace(/<script(.|\r?\n)*?>(.|\r?\n)*?<\/script>/g, '')
                .replace(/<iframe(.|\r?\n)*?>(.|\r?\n)*?<\/iframe>/g, '')
                .replace(/<frame(.|\r?\n)*?>(.|\r?\n)*?<\/frame>/g, '');
        });
    }, 3000);
}());
