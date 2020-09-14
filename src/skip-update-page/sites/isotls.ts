import { openLinksFactory } from '../util'

export const isoTlsConfig: SkipUpdateConfigOptions[] = [
  {
    urls: [
      /isotls.com\/feed\//
    ],
    cb: openLinksFactory({
      selector: '.post-content a',
      filterHref: /isotls.com/,
      onlyOnce: true,
    })
  }
];

