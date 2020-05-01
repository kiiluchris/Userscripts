import { EXTENSION_NAME } from './constants.js';

export const getMessageFromExtension = (status: string) => new Promise<boolean>(res => {
  window.addEventListener("message", ({ data: { extension, status: s } }) => {
    if (extension === 'Comic Manager' && status === s) {
      res(true);
    }
  });
});

export const setWindowMessageListenerOfType = <T>(messageType: string | null = null) => (condition: (data: T) => boolean) => (fn: ExternalMessageListener<T>) => {
  if (!condition) throw "No condition function given";
  const listener: InternalMessageListener<T> = ({ data: { extension, messageType: m, data } }) => {
    if (extension === EXTENSION_NAME && m == messageType && condition(data)) {
      fn(data, listener)
    }
  }
  window.addEventListener("message", listener);
}

export const setWindowMessageListener = setWindowMessageListenerOfType()


export const getWindowMessageOfType = <T>(messageType: string | null = null) => (condition: (data: T) => boolean) => new Promise((res, rej) => {
  setWindowMessageListenerOfType<T>(messageType)(condition)((data, listener) => {
    console.log(data)
    res(data)
    window.removeEventListener("message", listener)
  })
})

export const getWindowMessage = getWindowMessageOfType()

export const sendWindowMessageWithType = <T>(messageType = null) => (data: T, { mWindow = window, target = "*" } = {}) => {
  mWindow.postMessage({
    extension: EXTENSION_NAME,
    messageType,
    data,
  }, target);
};

export const sendWindowMessage = sendWindowMessageWithType(null)

export const windowMessaging: WindowMessagingDict = {}

export const windowLoaded = () => new Promise<boolean>(res => {
  if (document.readyState === 'complete') return res(false)
  window.addEventListener("load", e => {
    res(false);
  });
});


export const savePage = async (url: string) => {
  let timeoutID: number;
  const isPageSaved = await new Promise(res => {
    const extension = EXTENSION_NAME
    const listenForMessageConfirm = ({ data: { message, extensionName } }: MessageEvent) => {
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


export const runOnPageLoad = (fn: (hasLoaded: boolean) => any) => (
  Promise.race([
    getMessageFromExtension("loading"),
    windowLoaded()
  ]).then(fn)
);

export const eventTrigger = (eventName: string) => (el: HTMLElement, data: any = {}) => {
  const e = new CustomEvent(eventName, {
    ...data,
    extensionName: EXTENSION_NAME
  })
  el.dispatchEvent(e)
};


export const eventWatcher = (eventName: string) => (el: HTMLElement, data = {}) => {
  return new Promise(res =>
    el.addEventListener(eventName, res, { once: true })
  )
};
