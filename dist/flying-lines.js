const EXTENSION_NAME = 'Comic Manager';

const eventTrigger = (eventName) => (el, data = {}) => {
  const e = new CustomEvent(eventName, {
    ...data,
    extensionName: EXTENSION_NAME
  });
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


const clickElementAndLog = (selector, message, errorMessage) => {
  const flyingLinesLoadEventTrigger = eventTrigger('flyinglinesloaded');
  return _e => {
    flyingLinesLoadEventTrigger(document.body, {});
    const observer = new MutationObserver(_muts => {
      const element = document.querySelector(selector);
      if (!element) return console.log(errorMessage)
      observer.disconnect();
      console.log(message);
      element.click();

    });
    observer.observe(document.body, { childList: true });
  }
};


(function () {

  const hideNotificationPrompt = clickElementAndLog(
    '.browser-push .browser-push-btn[data-type="no"]',
    'Notification prompt hidden',
    'Notification prompt element not found'
  );

  const closeLoginForm = clickElementAndLog(
    'div.modal-login.in i.closes',
    'Login form closed',
    'Login form element not found'
  );

  const match = [
    [/www.flying-lines.com\/nu/, closeLoginForm],
    [/www.flying-lines.com\/chapter/, hideNotificationPrompt],
  ].find(([re]) => re.test(window.location.href));
  if (!match) return
  window.addEventListener('load', match[1]);
})();