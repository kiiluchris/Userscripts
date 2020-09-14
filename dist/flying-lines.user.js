// ==UserScript==
// @name           Flying Lines
// @namespace      http://tampermonkey.net/
// @version        0.1
// @author         You
// @description    try to take over the world!
// @match          https://www.flying-lines.com/chapter/**/*
// @match          https://www.flying-lines.com/nu/**/*
// @grant          none
// ==/UserScript==
// eslint-disable-next-line import/prefer-default-export
const EXTENSION_NAME = 'Comic Manager';

const eventTrigger = (eventName) => (el, data = {}) => {
    const e = new CustomEvent(eventName, {
        ...data,
        extensionName: EXTENSION_NAME,
    });
    el.dispatchEvent(e);
};

function mutationEventHandlerFactory(eventName, cb) {
    return (selector, message, errorMessage) => {
        const trigger = eventTrigger(eventName);
        return (_) => {
            trigger(document.body, {});
            const observer = new MutationObserver((_muts) => {
                const element = document.querySelector(selector);
                if (!element) {
                    console.log(errorMessage);
                    return;
                }
                observer.disconnect();
                console.log(message);
                cb(element);
            });
            observer.observe(document.body, {
                childList: true,
            });
        };
    };
}
const clickElementAndLog = mutationEventHandlerFactory('novel-multiverse-loaded', (el) => {
    el.click();
});
const deleteElementAndLog = mutationEventHandlerFactory('novelmultiverseloaded', (el) => {
    el.remove();
});
const multiFunc = (...fns) => (...args) => {
    fns.forEach((fn) => fn(...args));
};
(function () {
    const hideNotificationPrompt = clickElementAndLog('.browser-push .browser-push-btn[data-type="no"]', 'Notification prompt hidden', 'Notification prompt element not found');
    const hideVIPPrompt = clickElementAndLog('#layui-layer1 .icon-sprites3x', 'VIP prompt hidden', 'VIP prompt element not found');
    const closeLoginForm = clickElementAndLog('div.modal-login.in i.closes', 'Login form closed', 'Login form element not found');
    const hideSignupPrompt = deleteElementAndLog('.g1-popup.g1-popup-newsletter', 'Sign-up prompt hidden', 'Sign-up prompt element not found');
    const patterns = [
        [/www.flying-lines.com\/nu/, multiFunc(closeLoginForm, hideSignupPrompt)],
        [/www.flying-lines.com\/chapter/, multiFunc(hideNotificationPrompt, hideVIPPrompt, hideSignupPrompt)],
    ];
    const match = patterns.find(([re]) => re.test(window.location.href));
    if (!match) {
        return;
    }
    window.addEventListener('load', match[1]);
}());
