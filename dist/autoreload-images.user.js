// ==UserScript==
// @name           Autoreload Unloaded Images
// @namespace      http://tampermonkey.net/
// @version        0.1
// @author         You
// @description    try to take over the world!
// @include        /manganelo.com\/chapter/
// @grant          none
// @noframes       
// ==/UserScript==
const NumberOfRetries = (init) => {
    return {
        value: init,
        succ() { this.value++; return this; },
        eq(x) { return this.value === x; },
        lt(x) { return this.value < x; },
        lte(x) { return this.value <= x; },
        gt(x) { return this.value > x; },
        gte(x) { return this.value >= x; },
        reset() { this.value = init; return this; }
    };
};
(() => {
    const MAX_RETRIES = 5;
    const unloadedImages = new Set();
    const findImages = () => ([...document.getElementsByTagName('img')]);
    const monitorEvent = (eventName, condition, numRetries, maxRetries) => {
        return (el) => {
            el.addEventListener(eventName, (e) => {
                if (!window.navigator.onLine) {
                    numRetries.reset();
                    unloadedImages.add(el);
                    return;
                }
                if (condition(el, e) && numRetries.succ().gt(maxRetries))
                    return;
                const url = new URL(el.src);
                url.searchParams.set('reload_timestamp', Date.now() + '');
                el.src = url.href;
            });
        };
    };
    const otherwise = () => true;
    const imageNotCompletelyLoaded = (img) => !img.complete;
    const monitorEvents = (maxRetries) => (el) => {
        const numRetries = NumberOfRetries(0);
        monitorEvent('error', otherwise, numRetries, maxRetries)(el);
        window.addEventListener('load', () => {
            monitorEvent('load', imageNotCompletelyLoaded, numRetries, maxRetries)(el);
        });
    };
    findImages().forEach(monitorEvents(MAX_RETRIES));
    window.addEventListener("online", function (e) {
        unloadedImages.forEach(img => {
            img.dispatchEvent(new Event('error'));
        });
        unloadedImages.clear();
    });
})();
