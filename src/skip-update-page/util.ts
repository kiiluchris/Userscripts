import { getLinks, openLinks } from '../shared/link-open';

export const openLinksFactory = (options: SkipUpdateGetLinksOpts<HTMLAnchorElement>) => ((isSaved: boolean) => {
  const links = getLinks(options);
  return openLinks(links, isSaved);
});

const elClickerSetup = <El extends HTMLElement>(fn:  (selector: string) => El | null) => {
  return (selector: string) =>{
    return (): El | null => fn(selector)
  }
}

export const clickEl =  <El extends HTMLElement>(selector: string): El | null => {
  const el = document.querySelector<El>(selector)
  el?.click();
  return el
}

export const clickElSetup = elClickerSetup(clickEl);


export const clickLastEl = <El extends HTMLElement>(selector: string): El | null => {
  const el  = Array.from(document.querySelectorAll<El>('.entry-content a')).pop()
  el?.click();
  return el || null
}

export const clickLastElSetup = elClickerSetup(clickLastEl);


export const multiParentSelector = (...parents: string[]) => {
  return (child: string): string => parents.map((p) => `${p} ${child}`).join(', ')
};

export const elementExists = (selector: string): boolean => !!document.querySelector(selector);

export const waitForElement = <T extends HTMLElement>(selector: string, maxRetries: number) => {
  return new Promise<T | null>((res) => {
    const element = document.querySelector<T>(selector);
    if (element) { 
      res(element);  
    } else if (maxRetries < 1) { 
      res(null);
    } else {
      setTimeout(() => {
        res(waitForElement(selector, maxRetries - 1));
      }, 500);
    }
  })
};

export const mutationObserver = (cb: (m: MutationRecord, o: MutationObserver) => boolean) => {
  const observer = new MutationObserver(((mutations) => {
    for(const m of mutations) {
      if(cb(m, observer)){
        return;
      }
    }
  }));
  return observer;
}