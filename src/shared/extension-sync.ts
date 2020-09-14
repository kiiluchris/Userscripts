import { EXTENSION_NAME } from './constants';

export const getMessageFromExtension = (status: string) => new Promise<boolean>((res) => {
  window.addEventListener('message', ({ data: { extension, status: s } }) => {
    if (extension === 'Comic Manager' && status === s) {
      res(true);
    }
  });
});

export const setWindowMessageListenerOfType = <T>(messageType: string | null = null) => (
  (condition: (data: T) => boolean) => (fn: ExternalMessageListener<T>) => {
    if (!condition) throw new Error('No condition function given');
    const listener: InternalMessageListener<T> = ({
      data: {
        extension, messageType: m, data,
      },
    }) => {
      if (extension === EXTENSION_NAME && m === messageType && condition(data)) {
        fn(data, listener);
      }
    };
    window.addEventListener('message', listener);
  }
);

export const setWindowMessageListener = setWindowMessageListenerOfType();


export const getWindowMessageOfType = (messageType: string | null = null) => (
  <T>(condition: (data: T) => boolean) => new Promise<T>((res) => {
    setWindowMessageListenerOfType<T>(messageType)(condition)((data, listener) => {
      console.log(data);
      res(data);
      window.removeEventListener('message', listener);
    });
  }));

export const getWindowMessage = getWindowMessageOfType();

interface SendWindowMessageOpts {
  mWindow?: Window,
  target?: string,
}

export const sendWindowMessageWithType = (messageType: string | null = null) => <T>(data: T, { mWindow = window, target = '*' }: SendWindowMessageOpts = {}) => {
  mWindow.postMessage({
    extension: EXTENSION_NAME,
    messageType,
    data,
  }, target);
};

export const sendWindowMessage = sendWindowMessageWithType(null);

const windowMessagingBuilder = <T>(key: string): WindowMessaging<T> => ({
  addListener: setWindowMessageListenerOfType<T>(key),
  sendMessage: sendWindowMessageWithType(key),
  once: getWindowMessageOfType(key),
});

export const windowMessaging: WindowMessagingDict = {
  qtfra: windowMessagingBuilder('qtfra'),
};

export const windowLoaded = () => new Promise<boolean>((res) => {
  if (document.readyState === 'complete') {
    res(false);
    return;
  }
  window.addEventListener('load', (_e) => {
    res(false);
  });
});


export const savePage = async (url: string) => {
  let timeoutID: NodeJS.Timeout;
  const isPageSaved = await new Promise((res) => {
    const extension = EXTENSION_NAME;
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
      url,
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
    getMessageFromExtension('loading'),
    windowLoaded(),
  ]).then(fn)
);

export const eventTrigger = (eventName: string) => (el: HTMLElement, data: any = {}) => {
  const e = new CustomEvent(eventName, {
    ...data,
    extensionName: EXTENSION_NAME,
  });
  el.dispatchEvent(e);
};


export const eventWatcher = (eventName: string) => (
  (el: HTMLElement) => new Promise<Event>(
    (res) => el.addEventListener(eventName, res, { once: true }),
  )
);
