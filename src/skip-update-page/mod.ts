import { waybackify, urlWithDate } from '../shared/utils';
import { getLinks, openURLs, openLinks } from '../shared/link-open';
import {
  runOnPageLoad, getMessageFromExtension,
  getWindowMessage, sendWindowMessage, eventWatcher,
} from '../shared/extension-sync';
import { clickEl, clickElSetup, elementExists, multiParentSelector, openLinksFactory, clickLastElSetup, waitForElement, mutationObserver} from './util'
import { foxaholicConfig } from './sites/foxaholic';
import { zmunjaliConfig } from './sites/zmunjali';
import { isoTlsConfig } from './sites/isotls';




function checkUrlInArray(urls: RegExp[]) {
  if (!Array.isArray(urls)) {
    throw new Error('Array of url regex to match not provided');
  }
  
  return urls.findIndex((u) => waybackify(u).test(window.location.href));
}

unsafeWindow.userscripts = {
  ...unsafeWindow.userscripts,
  getLinks,
  matchParams(re: RegExp, opts: SkipUpdateGetLinksOpts<HTMLAnchorElement>) {
    return {
      links: getLinks(opts),
      matches: re.exec(window.location.href),
      get printConfig() {
        const nSpaces = (n: number) => ''.padStart(n, ' ');
        const nTabs = (tabSize: number) => (n: number) => nSpaces(tabSize * n);
        // eslint-disable-next-line no-underscore-dangle
        const _2Tabs = nTabs(2);
        const optObjStr = (obj: { [key: string]: any }, nesting = 0) => {
          const paddingOuter = nesting;
          const paddingInner = nesting + 1;
          const o = Object.entries(obj).reduce((acc, [k, v]) => {
            const val = typeof v === 'object' ? v.toString() : JSON.stringify(v);
            return `${acc + _2Tabs(paddingInner) + k}:  ${val},\n`;
          }, '{\n');
          
          return `${o + _2Tabs(paddingOuter)}}`;
        };
        const res = [
          '{',
          `  urls: [${re.toString()}],`,
          `  cb: openLinksFactory(${optObjStr(opts, 1)}),`,
          '}',
        ].join('\n');
        console.log(res);
        return res;
      },
    };
  },
};




runOnPageLoad(async (savedPage) => {
  if (savedPage) {
    await getMessageFromExtension('complete');
  }
  const config: SkipUpdateConfigOptions[] = [
    {
      urls: [/jigglypuffsdiary.com/],
      cb() {
        const select = $('div.wp_user_stylesheet_switcher select');
        select.val('1');
        select.trigger('change');
      },
    }, {
      urls: [/www.flying-lines.com\/nu\/./],
      cb: async (_isSaved) => {
        const flyingLinesLoadEventWatcher = eventWatcher('flyinglinesloaded');
        await Promise.race([
          flyingLinesLoadEventWatcher(document.body),
          new Promise<null>((res) => setTimeout(() => res(null), 2000)),
        ]);
        document.querySelector<HTMLAnchorElement>('a.continue-reading')?.click();
      },
    }, {
      urls: [
        /starrydawntranslations.wordpress.com\/20\d{2}\/\d{2}\/\d{2}/,
        /infinitenoveltranslations.net\/summoned-slaughterer-chapter-\d+/,
        /slothtranslations\.com\/20\d{2}\/\d{2}\/\d{2}/,
        /bcatranslation.com\/20\d{2}\/\d{2}\/\d{2}/,
        /praisethemetalbat.wordpress.com\/20\d{2}\/\d{2}\/\d{2}/,
        /sleepykorean.wordpress.com\/20\d{2}\/\d{2}\/\d{2}/,
        /volarenovels.com\/[\w-]+-chapter/,
        /tenshihonyakusha.wordpress.com\/20\d{2}\/\d{2}\/\d{2}/,
      ],
      cb: clickElSetup('.entry-content a')
    }, {
      urls: [/re-library.com\/20\d{2}\/\d{2}\/\d{2}/],
      cb: clickElSetup('.entry-content a[href*="/translations/"]'),
    }, {
      urls: [
        /yurikatrans.xyz\/uncategorized/,
      ],
      cb: openLinksFactory({
        selector: multiParentSelector('.entry-content', '#content')('a:not([href*="/uncategorized/"])[href*="yurikatrans.xyz/"]'),
      }),
    }, {
      urls: [/lightnovelstranslations.com\/[^/]+-(chapter|epilogue|prologue)/],
      cb: openLinksFactory({
        selector: '.entry-content a:not([href*="?share"])',
      }),
    }, {
      urls: [/bananachocolatecosmos.wordpress.com\/20\d{2}\/\d{2}\/\d{2}/, /novelsnchill\.com\/[^/]+-chapter-\d+-release/],
      cb: clickElSetup('.entry-content a[href*="chapter"]'),
    }, {
      urls: [/novelsformy.blogspot.com\/20\d{2}\/\d{2}/],
      cb: clickElSetup('.entry-content a[href*="/p/"]'),
    }, {
      urls: [
        /rebirth\.online\/20\d{2}\/\d{2}\/\d{2}/,
        /www.wuxiaworld\.com\/[^/]+chapter/,
      ],
      cb: clickLastElSetup('.entry-content a')
    }, {
      urls: [
        /funwithstela.web.id\/20\d{2}\/\d{2}\/\d{2}\/[^/]+-\d+-2/,
      ],
      cb: openLinksFactory({
        selector: '.post-content p a:not([title])',
        filterText: /^(chapter|chp?) \d+$/i,
      }),
    }, {
      urls: [
        /gravitytales.com\/post\/[^/]+\/[^/]+-chapter/,
      ],
      cb: openLinksFactory({
        selector: '.entry-content a[href*="/novel/"]',
      }),
    }, {
      urls: [
        /butterflyscurse.stream\/[^/]+-\d+\/?$/,
      ],
      async cb(isSaved) {
        const frame = await waitForElement<HTMLIFrameElement>('#disqus_thread > iframe[name^="dsq-app"]', 5);
        if (!frame) {
          console.error('Iframe not found');
          return;
        }
        sendWindowMessage({ hasLoaded: true }, {
          mWindow: frame.contentWindow!!,
        });
        const { urls } = await getWindowMessage<{ urls: string[] }>((data) => !!data.urls);
        openURLs(urls, isSaved);
      },
    }, {
      urls: [/radianttranslations.com\/20\d{2}\/\d{2}\/\d{2}/],
      cb: openLinksFactory({
        selector: '.entry-content a:not([title])',
        filterHref: /(?!20\d{2}\/\d{2}\/\d{2}\/).+chapter/,
      }),
    }, {
      urls: [/arkmachinetranslations.wordpress.com\/20\d{2}\/\d{2}\/\d{2}/],
      cb: openLinksFactory({
        selector: '.entry-content  a',
        filterHref: /index\/./,
      }),
    }, {
      urls: [/snowycodex.com\/[\w-]+-chapters?-\d+/],
      cb: openLinksFactory({
        selector: '.entry-content a:not(.jp-relatedposts-post-a)',
        filterHref: {
          test: (url: string) => !/(\?share|wp-content)/.test(url),
        },
      }),
    }, {
      urls: [
        /oppatranslations.com\/20\d{2}\/\d{2}\/\d{2}/,
        /rottentranslations.com\/20\d{2}\/\d{2}\/\d{2}/,
        /ktlchamber.wordpress.com\/20\d{2}\/\d{2}\/\d{2}/,
        /wordexcerpt.com\/[\w-]*(?:chapter|(?:epi|pro)logue)/,
        /plumlizi.com\/20\d{2}\/\d{2}\/\d{2}/,
        urlWithDate('nakimushitl.wordpress.com'),
        urlWithDate('greenlilytranslations.wordpress.com'),
      ],
      cb: openLinksFactory({
        selector: '.entry-content a:not(.jp-relatedposts-post-a)',
        filterText: /(chapter|(?:pro|epi)logue)/i,
      }),
    }, {
      urls: [
        /myoniyonitranslations\.com\/[^/]+\/{0,1}$/,
        /yado-inn.com\/20\d{2}\/\d{2}\/\d{2}/,
        /paichuntranslations.com\/20\d{2}\/\d{2}\/\d{2}/,
        /lightnovelstranslations\.com\/road-to-kingdom(?!\/)/,
      ],
      cb: openLinksFactory({
        selector: '.entry-content a',
        filterHref: /chapter/,
      }),
    }, {
      urls: [
        /moonbunnycafe\.com\/[\w-]+-chapter-\d+/,
      ],
      cb: openLinksFactory({
        selector: '.entry-content a',
        filterText: /(chapter \d+|\d+(st|nd|rd|th) chapter|t?here!?)/i,
        filterHref: /-ch(apter)?/,
      }),
    }, {
      urls: [
        /kitakamiooi(?:.wordpress)?.com\/20\d{2}\/\d{2}\/\d{2}/,
        /isohungrytls.com\/(?:20\d{2}\/\d{2}|uncategorized)\//,
      ],
      cb: openLinksFactory({
        selector: '.entry-content a, .entry a:not(.jp-relatedposts-post-a)',
        filterText: /(chapter|v\d+c\d+|(pro|epi)logue)/i,
      }),
    }, {
      urls: [/www.webnovel.com\/rssbook\/\d+\/\d+\/?$/],
      cb() {
        const link = document.querySelector<HTMLAnchorElement>('._ft.pa.l0.b0 > a');
        if (!link) return;
        if (link.href.startsWith('https')) {
          link.click();
          return;
        }
        mutationObserver((m, observer) => {
          if (m.type === 'attributes' && m.attributeName === 'href' && m.target instanceof HTMLElement) {
            m.target?.click();
            observer.disconnect();
            return true;
          }
          return false;
        }).observe(link, { attributes: true });
      },
    }, {
      urls: [/bayabuscotranslation\.com\/20\d{2}\/\d{2}\/\d{2}/],
      cb() {
        if (!window.location.pathname.match(/\/\d\/$/)) {
          clickEl('.page-links a');
        }
      },
    }, {
      urls: [/zirusmusings\.com\/20\d{2}\//],
      cb: openLinksFactory({
        selector: '#resizeable-text a',
        filterText: /Read Chapter Here/,
      }),
    }, {
      urls: [
        /dsrealm\.com\/[^/]*(?:news-and-chapter|chapter-\d+(?:-released)?)/,
        /dsrealmtranslations\.com\/reincarnated-as-a-dragons-egg\/dragon-egg-chapter-\d+/,
      ],
      cb: openLinksFactory({
        selector: '.post-content .kswr-shortcode-element a',
        filterHref: /table-of-contents/,
      }),
    }, {
      urls: [/convallariaslibrary.com\/20\d{2}\/\d{2}\/\d{2}/],
      cb: openLinksFactory({
        selector: '.post-content p a',
        filterHref: /convallariaslibrary.com\/translated/,
      }),
    }, {
      urls: [
        /fantranslationsblog.wordpress.com\/20\d{2}\/\d{2}\/\d{2}/,
        /www.blobtranslations.com\/sct-tfbnj-chapter-\d+/,
      ],
      cb: openLinksFactory({
        selector: '.entry-content > p a, .entry-content > a',
        filterText: /(chapter|(pro|epi)logue)/i,
        condition: () => elementExists('span.posted-on time'),
      }),
    }, {
      urls: [
        /lightnovelstranslations\.com\/[a-zA-Z0-9-]+-chapters?-\d+/,
      ],
      cb: openLinksFactory({
        selector: '.entry-content a',
        filterText: /CLICK HERE TO READ/,
      }),
    }, {
      urls: [/shikkakutranslations.org\/20\d{2}\/\d{2}\/\d{2}/],
      cb: openLinksFactory({
        selector: '.post .entry a',
        filterHref: /chapter-\d+\/$/,
      }),
    }, {
      urls: [/entruce.wordpress.com\/20\d{2}\/\d{2}\/\d{2}/],
      cb: openLinksFactory({
        selector: '.entry-content a',
        filterText: /Chapter \d+$/,
        filterHref: /projects/,
      }),
    }, {
      urls: [/lionmask.blogspot.com\/20\d{2}\/\d{2}\//],
      cb: openLinksFactory({
        selector: '.entry-content a',
        filterText: /Here's the (?:c|C)hapter/,
        filterHref: /lionmask.blogspot.com\/p\//,
      }),
    }, {
      urls: [/scrya.org\/20\d{2}\/\d{2}\/\d{2}/],
      cb: (isSaved) => {
        const chapterURL = (n: number) => (`http://scrya.org/my-disciple-died-yet-again/disciple-chapter-${n}/`);
        const title = document.querySelector<HTMLElement>('.entry-title')!!
        const [start, end] = title.innerText.match(/(\d+)/g)!!.map((c) => +c);
        const links = !end
        ? [chapterURL(start)]
        : [...Array(end - start + 1).keys()].map((i) => i + start).map((c) => chapterURL(c));
        return openURLs(links, isSaved);
      },
    }, {
      urls: [/rubymaybetranslations.com\/20\d{2}\/\d{2}\/\d{2}/],
      cb: openLinksFactory({
        selector: '.entry-content a:not(.jp-relatedposts-post-a)',
        filterText: /\d+$/,
        filterHref: /rubymaybetranslations.com\//,
      }),
    }, {
      urls: [/xaiomoge.com\/[^/]+\/?$/],
      cb: openLinksFactory({
        selector: '.entry-content a',
        filter: (el: HTMLAnchorElement) => el.className === '',
        condition: () => {
          return elementExists('.below-entry-meta .entry-date.published')
          && elementExists('.below-entry-meta .updated')
        },
        filterText: /chapter \d+/i,
        onlyOnce: true,
      }),
    }, {
      urls: [urlWithDate('sleepytranslations.com')],
      cb: openLinksFactory({
        selector: '.post a',
        filterText: /(chapter|(?:pro|epi)logue)/i,
      }),
    }, {
      urls: [urlWithDate('hinjakuhonyaku.com')],
      cb: openLinksFactory({
        selector: '.entry-content a',
        filterHref: /\/novels\//,
        filterText: /continue reading/,
      }),
    }, {
      urls: [urlWithDate('letsyuri.wordpress.com')],
      cb: openLinksFactory({
        selector: '.entry-content a',
        filterText: /^\s*here\.?\s*$/,
        filterHref: urlWithDate('letsyuri.wordpress.com'),
        onlyOnce: true,
      }),
    },
    ...foxaholicConfig,
    ...zmunjaliConfig,
    ...isoTlsConfig
  ];
  
  const match = config.find(({ urls }) => checkUrlInArray(urls) > -1);
  if (!match) {
    console.log('SkipUpdates Usersript: No URL matched');
    return;
  }
  const matchedRe = match.urls.find((u) => u.test(window.location.href));
  console.log(`SkipUpdates Usersript: Matched URL ${matchedRe}`);
  match.cb(savedPage);
}).catch(console.error);
