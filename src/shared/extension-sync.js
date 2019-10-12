import { EXTENSION_NAME } from './constants.js';

export const getMessageFromExtension = status => new Promise(res => {
  window.addEventListener("message", ({ data: { extension, status: s } }) => {
    if (extension === 'Comic Manager' && status === s) {
      res(true);
    }
  });
});

export const getWindowMessage = condition => new Promise((res, rej) => {
  if (!condition) return rej("No condition function given");
  window.addEventListener("message", ({ data: { extension, data } }) => {
    if (extension === EXTENSION_NAME && condition(data)) {
      console.log(data)
      res(data);
    }
  });
});

export const sendWindowMessage = (data, { mWindow = window, target = "*" } = {}) => {
  mWindow.postMessage({
    extension: EXTENSION_NAME,
    data
  }, target);
};

export const windowLoaded = () => new Promise(res => {
  window.addEventListener("load", e => {
    res(false);
  });
});


export const savePage = async (url) => {
  let timeoutID;
  const isPageSaved = await new Promise(res => {
    const extension = EXTENSION_NAME
    const listenForMessageConfirm = ({ data: { message, extensionName } }) => {
      if (extension === extensionName && `Saved: ${url}` === message) {
        window.removeEventListener('message', listenForMessageConfirm);
        clearTimeout(timeoutID);
        res(true);
      }
    };
    window.postMessage({
      extension,
      message: 'novelUpdatesSaveUrl',
      url
    }, window.location.href);
    window.addEventListener('message', listenForMessageConfirm);
    timeoutID = setTimeout(() => {
      window.removeEventListener('message', listenForMessageConfirm);
      res(false);
    }, 5000);
  });

  if (!isPageSaved) {
    throw new Error(`Save page failed: URL ${url} not saved`);
  }
};


export const runOnPageLoad = (fn) => (
  Promise.race([
    getMessageFromExtension("loading"),
    windowLoaded()
  ]).then(fn)
);

export const eventTrigger = (eventName) => (el, data = {}) => {
  const e = new CustomEvent(eventName, {
    ...data,
    extensionName: EXTENSION_NAME
  })
  el.dispatchEvent(e)
};


export const eventWatcher = (eventName) => (el, data = {}) => {
  return new Promise(res =>
    el.addEventListener(eventName, res, { once: true })
  )
};
