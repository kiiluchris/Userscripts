import './shared/globals';
import { openURLsInactiveTab } from './shared/link-open';
import { mkPrinter, printBlock } from './shared/utils'



(function () {
  const print = mkPrinter('Webnovel Open Boxnovel')
  const getTitle = (title: string): string => ({
    'Experimental Log of the Crazy Lich': 'the-experimental-log-of-the-crazy-lich',
    "It's Not Easy to Be a Man After Travelling to the Future": 'crossing-to-the-future-its-not-easy-to-be-a-man',
  } as { [key: string]: string })[title] || title;
  const formatTitle = (title: string) => title.toLowerCase().replace(/['|’]/g, '').replace(/ /g, '-');

  const boxNovelUrl = (formattedTitle: string) => `https://boxnovel.com/novel/${formattedTitle}/`;
  const vipNovelUrl = (formattedTitle: string) => `https://vipnovel.com/vipnovel/${formattedTitle}/`;

  const isRequiredEvent = (e: MouseEvent) => e.shiftKey && (e.ctrlKey || e.altKey);

  const urlFormatter = (e: MouseEvent) => (formattedTitle: string) => {
    const url = e.ctrlKey
      ? boxNovelUrl(formattedTitle)
      : vipNovelUrl.compose((u: string) => u.replace('the-experimental', 'experimental'))(formattedTitle);
    return { url, formattedTitle };
  };

  const staticNovelUrls = (title: string) => (data: {url: string, formattedTitle: string}) => {
    const staticUrls: string = ({
      'Supreme Magus': 'https://www.wuxiaworld.co/Supreme-Magus/',
    } as { [key: string]: string })[title] || data.url;
    return { url: staticUrls, formattedTitle: data.formattedTitle };
  };

  const addTooltip = (el?: HTMLElement | null): void => {
    if (!el) return;
    tippy(el, {
      content: el.innerHTML,
      interactive: true,
      allowHTML: true,
      size: 'large',
    });
  };
  type NovelUrl = { 
    [extUrl: string]: string; 
  };

  let novelUrls: NovelUrl = {}

  document.querySelectorAll<HTMLAnchorElement>('.m-book a').forEach((el) => {
    addTooltip(el.nextElementSibling?.nextElementSibling as HTMLElement | null);
    el.addEventListener('click', (e: MouseEvent) => {
      const title = el.getElementsByTagName('h3')[0].innerText;
      const { url, formattedTitle } = getTitle
        .andThen(formatTitle)
        .andThen(urlFormatter(e))
        .andThen(staticNovelUrls(title))(title);
      const webnovelUrl = new URL(el.href)
      webnovelUrl.searchParams.set('open-last-chapter', 'true')
      if (isRequiredEvent(e)) {
        e.preventDefault();
        print(`Opening ${formattedTitle} => ${url}`);
        novelUrls[url] = webnovelUrl.href
      } else if(e.ctrlKey && e.altKey){
        e.preventDefault();
        openURLsInactiveTab([ webnovelUrl.href ]);
      } else if (e.altKey){
        e.preventDefault()
        openURLsInactiveTab([ url ]);
      } 
    });
  });

  window.addEventListener('keyup', (e) => {
    if(!e.shiftKey) return;
    if(e.code === 'Period') {
      printBlock(print, (print) => {
        const urls = Object.keys(novelUrls).map((n) => {
          const extUrl = new URL(n)
          if(e.altKey){
            extUrl.searchParams.set('open-last-chapter', 'true')
          }
          return extUrl.href
        })
        urls.length && openURLsInactiveTab(urls);
        print('Opening tabs ' + novelUrls)
      })
    } else if (e.code === 'Comma') {
      const urls = [...new Set(Object.values(novelUrls))]
      urls.length && openURLsInactiveTab(urls);
      novelUrls = {}
      print('Cleared {novelUrls}')
    } else if(e.code === 'Slash'){
      novelUrls = {}
      print('Cleared {novelUrls}')
    }
  })
}());
