import { mkPrinter } from './shared/utils'

const print = mkPrinter('Webnovel Chapter Reader');

interface WindowLocationChangeListenerOptions {
  interval?: number; 
  once: boolean;
  fn: (oldUrl: string, newUrl: string) => void;
}
const mkWindowLocationChangeListener = ({ interval = 500, once, fn }: WindowLocationChangeListenerOptions) => {
  let windowUrl = window.location.href
  const listener = () => {
      setTimeout(() => {
        if(window.location.href !== windowUrl){
            const newUrl = window.location.href
            fn(windowUrl, newUrl);
            windowUrl = newUrl;
            if(!once) listener();
        } else  {
          listener();
        }
      }, interval);
  }

  return listener;
}

const closeWindowAfterUrlChange = mkWindowLocationChangeListener({
  interval: 500, 
  once: true, 
  fn: (_oldUrl, _newUrl) => {
   setTimeout(() => window.close(), 1000);
  }
});

const keyupListener = (e: KeyboardEvent) => {
  if(!e.altKey) return;
  if(e.key.toUpperCase() === 'L') {
    print('Opening last chapter')
    const chapterList = [...document.querySelectorAll<HTMLAnchorElement>('ol.catalog-chapter > li > a')]
    if(chapterList.length > 0) {
      chapterList[chapterList.length - 1].click()
      closeWindowAfterUrlChange();
    } else {
      setTimeout(() => keyupListener(e), 500);
    }
  }
};

; (() => {
    window.addEventListener('keyup', keyupListener);

    const webnovelUrl = new URL(window.location.href)
    if(webnovelUrl.searchParams.get('open-last-chapter') === 'true'){
        window.addEventListener('load', (_e) => {
            setTimeout(() => {
                window.dispatchEvent(new KeyboardEvent('keyup', {
                    key: 'L',
                    altKey: true,
                }));
            }, 2000);
        })
    }
})();
