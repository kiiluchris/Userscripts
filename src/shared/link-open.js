import { EXTENSION_NAME } from './constants'
import { savePage } from './extension-sync'

export async function openLinks(links, isSaved) {
  if (!links.length) return false;
  const [first, ...rest] = links;
  if (!isSaved) rest.reverse();
  for (const link of rest) {
    if (isSaved) await savePage(link.href);
    else {
      GM_openInTab(link.href, {
        active: false,
        insert: true,
        setParent: true
      });
    }
  }
  first.click();
  return true;
}

export function openURLs([firstUrl, ...urls], isSaved = false) {
  const links = urls.map(u => ({ href: u }));
  links.unshift({
    click() {
      const link = document.createElement('a');
      link.href = firstUrl;
      isSaved && link.addEventListener('click', function (e) {
        e.preventDefault();
        window.postMessage({
          message: "replaceMonitorNovelUpdatesUrl",
          url: link.href,
          extension: EXTENSION_NAME
        });
      });
      document.body.appendChild(link);
      link.click();
    }
  });
  return openLinks(links, isSaved)
}


export function getLinks({ elements, selector, filterHref, filterText, condition }) {
  if ((!selector && !elements) || (condition && !condition())) return [];
  let links = [...(selector ? document.querySelectorAll(selector) : elements)];
  if (filterHref) {
    links = links.filter(el => filterHref.test(el.href));
  }
  if (filterText) {
    links = links.filter(el => filterText.test(el.innerText));
  }
  return console.log(links) || links;
}
