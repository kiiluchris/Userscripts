import { EXTENSION_NAME } from './constants';
import { savePage } from './extension-sync';

export async function openLinks(links: ClickableWithHref[], isSaved: boolean) {
  if (!links.length) return false;
  const [first, ...rest] = links;
  if (!isSaved) rest.reverse();
  // eslint-disable-next-line no-restricted-syntax
  for (const link of rest) {
    // eslint-disable-next-line no-await-in-loop
    if (isSaved) await savePage(link.href);
    else {
      GM_openInTab(link.href, {
        active: false,
        insert: true,
        setParent: true,
      });
    }
  }
  first.click();
  return true;
}

const mkClickableWithHref = (url: string): ClickableWithHref => ({
  href: url,
  click(){}
})

const mkopenURLs = (
  mkFirstLink: (url: string, isSaved: boolean) => ClickableWithHref, 
  combineLinks: (first: ClickableWithHref, rest: ClickableWithHref[]) => ClickableWithHref[]
) => ([firstUrl, ...urls]: string[], isSaved: boolean = false) => {
  const links: ClickableWithHref[] = urls.map((u) => ({ href: u, click() { } }));
  const ls = combineLinks(mkFirstLink(firstUrl, isSaved), links);
  return openLinks(ls, isSaved);
}

export const openURLs = mkopenURLs((url, isSaved) => ({
  href: url,
  click() {
    const link = document.createElement('a');
    link.href = url;
    isSaved && link.addEventListener('click', (e) => {
      e.preventDefault();
      window.postMessage({
        message: 'replaceMonitorNovelUpdatesUrl',
        url: link.href,
        extension: EXTENSION_NAME,
      }, '*');
    });
    document.body.appendChild(link);
    link.click();
  },
}), (first, rest) => [first, ...rest])

export const openURLsInactiveTab = 
  mkopenURLs((url) => mkClickableWithHref(url), (first, rest) => [mkClickableWithHref(''), first, ...rest]) 

export function getLinks({
  elements, selector, filterHref,
  filterText, condition, filter,
  onlyOnce = false,
}: SkipUpdateGetLinksOpts<HTMLAnchorElement>) {
  if ((!selector && !elements) || (condition && !condition())) return [];
  let links = [...(selector
    ? document.querySelectorAll<HTMLAnchorElement>(selector)
    : (elements as HTMLAnchorElement[]))];
  if (filterHref) {
    links = links.filter((el) => filterHref.test(el.href));
  }
  if (filterText) {
    links = links.filter((el) => filterText.test(el.innerText));
  }
  if (filter) {
    links = links.filter(filter);
  }
  if (onlyOnce) {
    links = links.slice(0, 1);
  }

  console.log(links);
  return links;
}
