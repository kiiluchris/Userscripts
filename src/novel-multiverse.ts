import {
  eventTrigger,
} from './shared/extension-sync';



function mutationEventHandlerFactory(
  eventName: string,
  cb: <El extends HTMLElement>(el: El) => void,
) {
  return (selector: string, message: string, errorMessage: string) => {
    const trigger = eventTrigger(eventName);
    return <E extends Event>(_e: E) => {
      trigger(document.body, {});
      const observer = new MutationObserver((_muts) => {
        const element = document.querySelector<HTMLElement>(selector);
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

function multiFunc(...fns: ((e: Event) => void)[]) {
  return <E extends Event>(e: E) => {
    fns.forEach((fn) => fn(e));
  };
}


(function () {
  const hideNotificationPrompt = deleteElementAndLog(
    '.g1-popup.g1-popup-newsletter',
    'Sign-up prompt hidden',
    'Sign-up prompt element not found',
  );
  const hideVIPPrompt = clickElementAndLog(
    '#layui-layer1 .icon-sprites3x',
    'VIP prompt hidden',
    'VIP prompt element not found',
  );

  const closeLoginForm = clickElementAndLog(
    'div.modal-login.in i.closes',
    'Login form closed',
    'Login form element not found',
  );
  const patterns: [RegExp, <E extends Event>(e: E) => void][] = [
    [/www.flying-lines.com\/nu/, closeLoginForm],
    [/www.flying-lines.com\/chapter/, multiFunc(hideNotificationPrompt, hideVIPPrompt)],
  ];
  const match = patterns.find(([re]) => re.test(window.location.href));
  if (!match) {
    return;
  }
  window.addEventListener('load', multiFunc(hideNotificationPrompt, hideVIPPrompt));
}());
