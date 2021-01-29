const cleanText: Record<string, (novelText: HTMLDivElement) => void> = {
  "the-male-leads-villainess-stepmother": (novelText) => {
    const lastP = novelText.lastElementChild;
    lastP!!.innerHTML = lastP!!.innerHTML.replace(
      /The website has been changed.*/g,
      ""
    );
  },
};

type Page = "novelupdates" | "mtlnovel";

function pageRegex(page: Page) {
  if (page === "novelupdates") {
    return /www.novelupdates.com\/series\/([^/?]+)/;
  } else {
    return /www.mtlnovel.com\/([^/]+)\//;
  }
}

function mtlNovelToc(novelName: string) {
  return `https://www.mtlnovel.com/${novelName}/chapter-list/`;
}

function pageUrl(page: Page, novelName: string) {
  if (page === "novelupdates") {
    return mtlNovelToc(novelName);
  } else {
    return `https://www.novelupdates.com/series/${novelName}/`;
  }
}

function pageHook(targetPage: Page) {
  return (page: Page, fn: () => void) => {
    page == targetPage && fn();
  };
}

const mtlNovelHook = pageHook("mtlnovel");
const novelUpdatesHook = pageHook("novelupdates");

(function () {
  "use strict";
  const page: Page = window.location.href.startsWith(
    "https://www.novelupdates.com/series/"
  )
    ? "novelupdates"
    : "mtlnovel";
  const re = pageRegex(page);
  const novelName = re.exec(window.location.href)?.[1];
  const novelText = document.querySelector<HTMLDivElement>(
    'div[class^="par fontsize-"'
  );
  novelName && novelText && cleanText[novelName]?.(novelText);
  mtlNovelHook(page, () => {
    document
      .querySelectorAll<HTMLAnchorElement>(".chapter-nav a.toc")
      .forEach((el) => {
        if (novelName) {
          el.href = mtlNovelToc(novelName);
        }
      });
  });
  window.addEventListener("keyup", (e) => {
    if (e.altKey && e.key.toLowerCase() === "n" && novelName) {
      GM_openInTab(pageUrl(page, novelName), {
        active: false,
        setParent: true,
      });
    }
  });
})();
