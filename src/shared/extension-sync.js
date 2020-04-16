import { EXTENSION_NAME } from './constants.js';

export const getMessageFromExtension = status => new Promise(res => {
  window.addEventListener("message", ({ data: { extension, status: s } }) => {
    if (extension === 'Comic Manager' && status === s) {
      res(true);
    }
  });
});

export const setWindowMessageListenerOfType = (messageType = null) => condition => fn => {
  if (!condition) throw "No condition function given";
  const listener = ({ data: { extension, messageType: m, data } }) => {
    if (extension === EXTENSION_NAME && m == messageType && condition(data)) {
      fn(data, listener)
    }
  }
  window.addEventListener("message", listener);
}

export const setWindowMessageListener = setWindowMessageListenerOfType()


export const getWindowMessageOfType = (messageType = null) => condition => new Promise((res, rej) => {
  setWindowMessageListenerOfType(messageType)(condition)((data, listener) => {
    console.log(data)
    res(data)
    window.removeEventListener("message", listener)
  })
})

export const getWindowMessage = getWindowMessageOfType()

export const sendWindowMessageWithType = (messageType = null) => (data, { mWindow = window, target = "*" } = {}) => {
  mWindow.postMessage({
    extension: EXTENSION_NAME,
    messageType,
    data,
  }, target);
};

export const sendWindowMessage = sendWindowMessageWithType(null)

export const windowMessaging = ["playback", "rawPlayback"].reduce((acc, key) => {
  acc[key] = {
    addListener: setWindowMessageListenerOfType(key),
    sendMessage: sendWindowMessageWithType(key),
    once: getWindowMessageOfType(key)
  }
  return acc
}, {})

export const windowLoaded = () => new Promise(res => {
  if (document.readyState === 'complete') return res(false)
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
