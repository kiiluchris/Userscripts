const EXTENSION_NAME = 'Comic Manager';

const setWindowMessageListenerOfType = (messageType = null) => condition => fn => {
  if (!condition) throw "No condition function given";
  const listener = ({ data: { extension, messageType: m, data } }) => {
    if (extension === EXTENSION_NAME && m == messageType && condition(data)) {
      fn(data, listener);
    }
  };
  window.addEventListener("message", listener);
};


const getWindowMessageOfType = (messageType = null) => condition => new Promise((res, rej) => {
  setWindowMessageListenerOfType(messageType)(condition)((data, listener) => {
    console.log(data);
    res(data);
    window.removeEventListener("message", listener);
  });
});

const sendWindowMessageWithType = (messageType = null) => (data, { mWindow = window, target = "*" } = {}) => {
  mWindow.postMessage({
    extension: EXTENSION_NAME,
    messageType,
    data,
  }, target);
};

const windowMessaging = ["playback"].reduce((acc, key) => {
  acc[key] = {
    addListener: setWindowMessageListenerOfType(key),
    sendMessage: sendWindowMessageWithType(key),
    once: getWindowMessageOfType(key)
  };
  return acc
}, {});

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

const multiFunc = (...fns) => {
  return (...args) => {
    fns.forEach(fn => fn(...args));
  }
};


(function () {

  const hideNotificationPrompt = clickElementAndLog(
    '.browser-push .browser-push-btn[data-type="no"]',
    'Notification prompt hidden',
    'Notification prompt element not found'
  );
  const hideVIPPrompt = clickElementAndLog(
    '#layui-layer1 .icon-sprites3x',
    'VIP prompt hidden',
    'VIP prompt element not found'
  );

  const closeLoginForm = clickElementAndLog(
    'div.modal-login.in i.closes',
    'Login form closed',
    'Login form element not found'
  );

  const match = [
    [/www.flying-lines.com\/nu/, closeLoginForm],
    [/www.flying-lines.com\/chapter/, multiFunc(hideNotificationPrompt, hideVIPPrompt)],
  ].find(([re]) => re.test(window.location.href));
  if (!match) return
  window.addEventListener('load', match[1]);
})();
