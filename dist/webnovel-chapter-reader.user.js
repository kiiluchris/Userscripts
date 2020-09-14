// ==UserScript==
// @name           Webnovel Chapter Reader
// @namespace      http://tampermonkey.net/
// @version        0.1
// @author         kiiluchris
// @description    try to take over the world!
// @match          https://www.webnovel.com/book/*
// @run-at         document-end
// ==/UserScript==
const mkPrinter = (name) => (msg, ...rest) => {
    console.group(name);
    console.log(msg);
    console.log(...rest);
    console.groupEnd();
};

const print = mkPrinter('Webnovel Chapter Reader');
const mkWindowLocationChangeListener = ({ interval = 500, once, fn }) => {
    let windowUrl = window.location.href;
    const listener = () => {
        setTimeout(() => {
            if (window.location.href !== windowUrl) {
                const newUrl = window.location.href;
                fn(windowUrl, newUrl);
                windowUrl = newUrl;
                if (!once)
                    listener();
            }
            else {
                listener();
            }
        }, interval);
    };
    return listener;
};
const closeWindowAfterUrlChange = mkWindowLocationChangeListener({
    interval: 500,
    once: true,
    fn: (_oldUrl, _newUrl) => {
        setTimeout(() => window.close(), 1000);
    }
});
const keyupListener = (e) => {
    if (!e.altKey)
        return;
    if (e.key.toUpperCase() === 'L') {
        print('Opening last chapter');
        const chapterList = [...document.querySelectorAll('ol.catalog-chapter > li > a')];
        if (chapterList.length > 0) {
            chapterList[chapterList.length - 1].click();
            closeWindowAfterUrlChange();
        }
        else {
            setTimeout(() => keyupListener(e), 500);
        }
    }
};
(() => {
    window.addEventListener('keyup', keyupListener);
    const webnovelUrl = new URL(window.location.href);
    if (webnovelUrl.searchParams.get('open-last-chapter') === 'true') {
        window.addEventListener('load', (_e) => {
            setTimeout(() => {
                window.dispatchEvent(new KeyboardEvent('keyup', {
                    key: 'L',
                    altKey: true,
                }));
            }, 2000);
        });
    }
})();
