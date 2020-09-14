import { eventTrigger } from './shared/extension-sync';




function mutationEventHandlerFactory(eventName: string, cb: (el: HTMLElement) => void) {
  return (selector: string, message: string, errorMessage: string) => {
    const trigger = eventTrigger(eventName);
    return (_: Event) => {
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

const multiFunc = (...fns: ((...a: any[]) => void)[]) => (...args: any[]) => {
  fns.forEach((fn) => fn(...args));
};


(function () {
  const hideNotificationPrompt = clickElementAndLog(
    '.browser-push .browser-push-btn[data-type="no"]',
    'Notification prompt hidden',
    'Notification prompt element not found',
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

  const hideSignupPrompt = deleteElementAndLog('.g1-popup.g1-popup-newsletter', 'Sign-up prompt hidden', 'Sign-up prompt element not found');
  const patterns: [RegExp, (e: Event) => void][] = [
    [/www.flying-lines.com\/nu/, multiFunc(closeLoginForm, hideSignupPrompt)],
    [/www.flying-lines.com\/chapter/, multiFunc(hideNotificationPrompt, hideVIPPrompt, hideSignupPrompt)],
  ];
  const match = patterns.find(([re]) => re.test(window.location.href));
  if (!match) {
    return;
  }
  window.addEventListener('load', match[1]);
}());
