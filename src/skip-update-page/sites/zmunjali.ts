// import { openLinksFactory } from "../util";

export const zmunjaliConfig: SkipUpdateConfigOptions[] = [
  {
    urls: [
      /zmunjali.wordpress.com\/20\d{2}\/\d{2}\/\d{2}/,
    ],
    cb() {
      const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('.entry-content a'));
      let link = links.shift();
      while (link && !/\(~’.’\)~/.test((link).innerHTML)) {
        link = links.shift();
      }
      if (!link) {
        link = Array.from(document.querySelectorAll<HTMLAnchorElement>('.entry-content p a')).pop();
      }
      const match = window.location.pathname.match(/part-(\d+)/);
      if (match && match[1]) {
        link!!.href += `#part${match[1]}`;
      }
      link!!.click();
    },
  }, {
    urls: [/zmunjali.wordpress.com\/[^/]+\/[^/]+chapter-\d+/],
    cb() {
      const { hash } = window.location;
      if (!hash) return;
      const match = /^#part(\d+)$/.exec(hash);
      if (!match) return;
      const part = match[1];
      let sections = [...document.querySelectorAll('.entry-content b')]
      sections = sections.filter((el) => /Part \d/i.test(el.innerHTML));
      const fraction = (+part - 1) / +part;
      sections[Math.ceil(sections.length * fraction)].scrollIntoView();
    },
  },
]