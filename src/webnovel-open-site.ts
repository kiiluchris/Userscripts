import "./shared/globals";
import { openURLsInactiveTab } from "./shared/link-open";

(function () {
  const addTooltip = (el?: HTMLElement | null): void => {
    if (!el) return;
    tippy(el, {
      content: el.innerHTML,
      interactive: true,
      allowHTML: true,
      size: "large",
    });
  };
  const formatTitle = (title: string) =>
    title.toLowerCase().replace(/['|’]/g, "").replace(/ /g, "-");
  const titleElement = (el: HTMLElement) => el.getElementsByTagName("h3")[0]!!;
  const elementTitle = (el: HTMLElement) =>
    formatTitle(titleElement(el).innerText);
  const boxNovelUrl = (formattedTitle: string) =>
    `https://boxnovel.com/novel/${formattedTitle}/`;
  const vipNovelUrl = (formattedTitle: string) =>
    `https://vipnovel.com/vipnovel/${formattedTitle}/`;
  const mangaBobUrl = (formattedTitle: string) =>
    `https://mangabob.com/manga/${formattedTitle}/`;
  const defaultSwapperPredicate = (title?: string) => !!title;
  const makeSwapper = (
    altUrls: Record<string, string>,
    predicate: (t?: string) => boolean = defaultSwapperPredicate
  ) => (title: string, mapper?: (t: string) => string) => {
    const alt = altUrls[title];
    return predicate(alt) ? alt : mapper ? mapper(title) : title;
  };
  const swapWholeUrl = makeSwapper({
    "supreme-magus": "https://www.wuxiaworld.co/Supreme-Magus/",
  });
  const swapTitle = makeSwapper({
    "Experimental Log of the Crazy Lich":
      "the-experimental-log-of-the-crazy-lich",
    "It's Not Easy to Be a Man After Travelling to the Future":
      "crossing-to-the-future-its-not-easy-to-be-a-man",
  });
  const isComic = (el: HTMLElement): boolean => {
    return (
      el
        .querySelector<HTMLSpanElement>("span._tag_sub")
        ?.innerText.toLowerCase() === "comics"
    );
  };
  const getUrlBuilder = (
    parentEl: HTMLElement,
    e: MouseEvent
  ): ((title: string) => string) => {
    if (isComic(parentEl)) {
      return mangaBobUrl;
    } else if (e.ctrlKey) {
      return boxNovelUrl;
    } else {
      return vipNovelUrl.compose((u: string) =>
        u.replace("the-experimental", "experimental")
      );
    }
  };

  document.querySelectorAll<HTMLAnchorElement>(".m-book a").forEach((el) => {
    addTooltip(el.nextElementSibling?.nextElementSibling as HTMLElement | null);
    el.addEventListener("click", (e: MouseEvent) => {
      const formattedTitle = swapTitle(elementTitle(el));
      const buildUrl = getUrlBuilder(el, e);
      const url = swapWholeUrl(buildUrl(formattedTitle));
      const webnovelUrl = new URL(el.href);
      webnovelUrl.searchParams.set("open-last-chapter", "true");
      if (!(e.altKey || e.ctrlKey)) return;
      e.preventDefault();
      if (e.ctrlKey && e.altKey) {
        e.preventDefault();
        openURLsInactiveTab([webnovelUrl.href]);
      } else {
        e.preventDefault();
        openURLsInactiveTab([url]);
      }
    });
  });
})();
