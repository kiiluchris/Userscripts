import { openLinksFactory } from "../util";

export const foxaholicConfig: SkipUpdateConfigOptions[] = [
  {
    urls: [/foxaholic.blog\/20\d{2}\/\d{2}\/\d{2}/],
    cb: openLinksFactory({
      selector: '.entry-content a:not([class])',
      filterText: /Free/,
    }),
  },
  {
    urls: [/foxaholic.com\/novel\/the-villains-i-raised-all-died\/chapter/],
    cb: openLinksFactory({
      selector: '.entry-content a',
      filterText: /Chapter \d+/
    })
  }
]