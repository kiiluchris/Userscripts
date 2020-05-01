const EXTENSION_NAME = 'Comic Manager';

const eventTrigger = (eventName) => (el, data = {}) => {
    const e = new CustomEvent(eventName, Object.assign(Object.assign({}, data), { extensionName: EXTENSION_NAME }));
    el.dispatchEvent(e);
};

// ==UserScript==
// @name         Flying Lines
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.flying-lines.com/chapter/**/*
// @match        https://www.flying-lines.com/nu/**/*
// @grant        none
// ==/UserScript==
function mutationEventHandlerFactory(eventName, cb) {
    return (selector, message, errorMessage) => {
        const trigger = eventTrigger(eventName);
        return (_e) => {
            trigger(document.body, {});
            const observer = new MutationObserver(_muts => {
                const element = document.querySelector(selector);
                if (!element) {
                    return console.log(errorMessage);
                }
                observer.disconnect();
                console.log(message);
                cb(element);
            });
            observer.observe(document.body, {
                childList: true
            });
        };
    };
}
const clickElementAndLog = mutationEventHandlerFactory('novel-multiverse-loaded', el => {
    el.click();
});
const deleteElementAndLog = mutationEventHandlerFactory('novelmultiverseloaded', el => {
    el.remove();
});
function multiFunc(...fns) {
    return (e) => {
        fns.forEach(fn => fn(e));
    };
}
(function () {
    const hideNotificationPrompt = deleteElementAndLog('.g1-popup.g1-popup-newsletter', 'Sign-up prompt hidden', 'Sign-up prompt element not found');
    const hideVIPPrompt = clickElementAndLog('#layui-layer1 .icon-sprites3x', 'VIP prompt hidden', 'VIP prompt element not found');
    const closeLoginForm = clickElementAndLog('div.modal-login.in i.closes', 'Login form closed', 'Login form element not found');
    const patterns = [
        [/www.flying-lines.com\/nu/, closeLoginForm],
        [/www.flying-lines.com\/chapter/, multiFunc(hideNotificationPrompt, hideVIPPrompt)],
    ];
    const match = patterns.find(([re]) => re.test(window.location.href));
    if (!match) {
        return;
    }
    window.addEventListener('load', multiFunc(hideNotificationPrompt, hideVIPPrompt));
})();
