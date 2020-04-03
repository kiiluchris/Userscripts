const regexConcat = re1 => {
    const re1Str = typeof re1 === "string" ? re1 : String(re1).slice(1, -1);
    return re2 => {
        const re2Str = typeof re2 === "string" ? re2 : String(re2).slice(1, -1);
        return new RegExp(re1Str + re2Str)
    }
};

const waybackify = re => {
    const reStr = String(re).slice(1, -1);
    return regexConcat(/(?:web.archive.org\/web\/\d+\/.*)?/)(reStr.replace(/(?:\\\/|$)/, "(:80)?\\\/"))
};

const EXTENSION_NAME = 'Comic Manager';

const getMessageFromExtension = status => new Promise(res => {
  window.addEventListener("message", ({ data: { extension, status: s } }) => {
    if (extension === 'Comic Manager' && status === s) {
      res(true);
    }
  });
});

const setWindowMessageListenerOfType = (messageType = null) => condition => fn => {
  if (!condition) throw "No condition function given";
  const listener = ({ data: { extension, messageType: m, data } }) => {
    if (extension === EXTENSION_NAME && m == messageType && condition(data)) {
      fn(data, listener);
    }
  };
  window.addEventListener("message", listener);
};


const getWindowMessageOfType = (messageType = null) => condition => new Promise((res, rej) => {
  setWindowMessageListenerOfType(messageType)(condition)((data, listener) => {
    console.log(data);
    res(data);
    window.removeEventListener("message", listener);
  });
});

const getWindowMessage = getWindowMessageOfType();

const sendWindowMessageWithType = (messageType = null) => (data, { mWindow = window, target = "*" } = {}) => {
  mWindow.postMessage({
    extension: EXTENSION_NAME,
    messageType,
    data,
  }, target);
};

const sendWindowMessage = sendWindowMessageWithType(null);

const windowMessaging = ["playback"].reduce((acc, key) => {
  acc[key] = {
    addListener: setWindowMessageListenerOfType(key),
    sendMessage: sendWindowMessageWithType(key),
    once: getWindowMessageOfType(key)
  };
  return acc
}, {});

const windowLoaded = () => new Promise(res => {
  if (document.readyState === 'complete') return res(false)
  window.addEventListener("load", e => {
    res(false);
  });
});


const savePage = async (url) => {
  let timeoutID;
  const isPageSaved = await new Promise(res => {
    const extension = EXTENSION_NAME;
    const listenForMessageConfirm = ({ data: { message, extensionName } }) => {
      if (extension === extensionName && `Saved: ${url}` === message) {
        window.removeEventListener('message', listenForMessageConfirm);
        clearTimeout(timeoutID);
        res(true);
      }
    };
    window.postMessage({
      extension,
      message: 'novelUpdatesSaveUrl',
      url
    }, window.location.href);
    window.addEventListener('message', listenForMessageConfirm);
    timeoutID = setTimeout(() => {
      window.removeEventListener('message', listenForMessageConfirm);
      res(false);
    }, 5000);
  });

  if (!isPageSaved) {
    throw new Error(`Save page failed: URL ${url} not saved`);
  }
};


const runOnPageLoad = (fn) => (
  Promise.race([
    getMessageFromExtension("loading"),
    windowLoaded()
  ]).then(fn)
);


const eventWatcher = (eventName) => (el, data = {}) => {
  return new Promise(res =>
    el.addEventListener(eventName, res, { once: true })
  )
};

async function openLinks(links, isSaved) {
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

function openURLs([firstUrl, ...urls], isSaved = false) {
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


function getLinks({ elements, selector, filterHref, filterText, condition }) {
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

// ==UserScript==
// @name         Skip Novel Update Page
// @namespace    https://bitbucket.org/kiilu_chris/userscripts/raw/HEAD/skipUpdatePage.user.js
// @version      0.1.6
// @description  Open Novel Chapters Immediately
// @author       kiilu_chris
// @match        http*://**/*
// @noframes
// @grant        GM_openInTab
// @grant        unsafeWindow
// @run-at       document-end
// ==/UserScript==


function checkUrlInArray(urls) {
  if (!Array.isArray(urls)) {
    throw new Error("Array of url regex to match not provided");
  }

  return urls.findIndex(u => waybackify(u).test(window.location.href));
}

unsafeWindow.userscripts = {
  ...unsafeWindow.userscripts,
  getLinks,
  matchParams(re, opts) {
    return {
      links: getLinks(opts),
      matches: re.exec(window.location.href),
      get printConfig() {
        const nSpaces = n => ''.padStart(n, ' ');
        const nTabs = tabSize => n => nSpaces(tabSize * n);
        const _2Tabs = nTabs(2);
        const optObjStr = (obj, nesting = 0) => {
          const paddingOuter = nesting;
          const paddingInner = nesting + 1;
          const o = Object.entries(obj).reduce((acc, [k, v]) => {
            const val = typeof v === 'object' ? v.toString() : JSON.stringify(v);
            return acc + _2Tabs(paddingInner) + k + ':  ' + val + ',\n'
          }, '{\n');

          return o + _2Tabs(paddingOuter) + '}'
        };
        console.log([
          '{',
          '  urls: [' + re.toString() + '],',
          '  cb: openLinksFactory(' + optObjStr(opts, 1) + '),',
          '}',
        ].join('\n'));
      }
    }
  }
};

const openLinksFactory = (options) => (
  (isSaved) => {
    const links = getLinks(options);
    return openLinks(links, isSaved)
  }
);

const clickElSetup = selector => () => document.querySelector(selector).click();
const multiParentSelector = (...parents) => child => parents.map(p => p + ' ' + child);
runOnPageLoad(async savedPage => {
  if (savedPage) {
    await getMessageFromExtension("complete");
  }
  const config = [{
    urls: [/jigglypuffsdiary.com/],
    cb() {
      let select = window.jQuery('div.wp_user_stylesheet_switcher select');
      select.val("1");
      select.trigger("change");
    }
  }, {
    urls: [/www.flying-lines.com\/nu\/./],
    cb: async _isSaved => {
      const flyingLinesLoadEventWatcher = eventWatcher('flyinglinesloaded');
      await flyingLinesLoadEventWatcher(document.body, {});
      document.querySelector('a.continue-reading').click();
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
    cb() {
      document.querySelector('.entry-content a').click();
    }
  }, {
    urls: [/re-library.com\/20\d{2}\/\d{2}\/\d{2}/,],
    cb: clickElSetup('.entry-content a[href*="/translations/"]')
  }, {
    urls: [
      /yurikatrans.xyz\/uncategorized/
    ],
    cb: openLinksFactory({
      selector: multiParentSelector('.entry-content', '#content')('a:not([href*="/uncategorized/"])[href*="yurikatrans.xyz/"]')
    })
  }, {
    urls: [/lightnovelstranslations.com\/[^\/]+-(chapter|epilogue|prologue)/],
    cb: openLinksFactory({
      selector: '.entry-content a:not([href*="?share"])'
    })
  }, {
    urls: [/foxaholic.blog\/20\d{2}\/\d{2}\/\d{2}/],
    cb: openLinksFactory({
      selector: ".entry-content a:not([class])",
      filterText: /Free/,
    }),
  }, {
    urls: [/bananachocolatecosmos.wordpress.com\/20\d{2}\/\d{2}\/\d{2}/, /novelsnchill\.com\/[^\/]+-chapter-\d+-release/],
    cb: clickElSetup('.entry-content a[href*="chapter"]')
  }, {
    urls: [/novelsformy.blogspot.com\/20\d{2}\/\d{2}/],
    cb: clickElSetup('.entry-content a[href*="/p/"]')
  }, {
    urls: [
      /rebirth\.online\/20\d{2}\/\d{2}\/\d{2}/,
      /www.wuxiaworld\.com\/[^\/]+chapter/,
    ],
    cb() {
      Array.from(document.querySelectorAll('.entry-content a')).pop().click();
    }
  }, {
    urls: [
      /funwithstela.web.id\/20\d{2}\/\d{2}\/\d{2}\/[^\/]+-\d+-2/
    ],
    cb: openLinksFactory({
      selector: '.post-content p a:not([title])',
      filterText: /^(chapter|chp?) \d+$/i
    })
  }, {
    urls: [
      /gravitytales.com\/post\/[^\/]+\/[^\/]+-chapter/
    ],
    cb: openLinksFactory({
      selector: '.entry-content a[href*="/novel/"]'
    })
  }, {
    urls: [
      /butterflyscurse.stream\/[^\/]+-\d+\/?$/
    ],
    async cb(isSaved) {
      const frame = document.querySelector('#disqus_thread > iframe[name^="dsq-app"]');
      sendWindowMessage({ hasLoaded: true }, {
        mWindow: frame.contentWindow
      });
      const { urls } = await getWindowMessage(data => !!data.urls);
      return openURLs(urls, isSaved);
    }
  }, {
    urls: [/radianttranslations.com\/20\d{2}\/\d{2}\/\d{2}/],
    cb: openLinksFactory({
      selector: '.entry-content a:not([title])',
      filterHref: /(?!20\d{2}\/\d{2}\/\d{2}\/).+chapter/
    })
  }, {
    urls: [/arkmachinetranslations.wordpress.com\/20\d{2}\/\d{2}\/\d{2}/],
    cb: openLinksFactory({
      selector: '.entry-content  a',
      filterHref: /index\/./
    })
  }, {
    urls: [/snowycodex.com\/[\w-]+-chapters?-\d+/],
    cb: openLinksFactory({
      selector: '.entry-content a:not(.jp-relatedposts-post-a)',
      filterHref: {
        test: url => !/(\?share|wp-content)/.test(url)
      }
    })
  }, {
    urls: [
      /oppatranslations.com\/20\d{2}\/\d{2}\/\d{2}/,
      /rottentranslations.com\/20\d{2}\/\d{2}\/\d{2}/,
      /ktlchamber.wordpress.com\/20\d{2}\/\d{2}\/\d{2}/,
      /wordexcerpt.com\/[\w-]*(?:chapter|(?:epi|pro)logue)/,
      /plumlizi.com\/20\d{2}\/\d{2}\/\d{2}/,
    ],
    cb: openLinksFactory({
      selector: '.entry-content a',
      filterText: /(chapter|(?:pro|epi)logue)/i
    })
  }, {
    urls: [
      /myoniyonitranslations\.com\/[^/]+\/{0,1}$/,
      /yado-inn.com\/20\d{2}\/\d{2}\/\d{2}/,
      /paichuntranslations.com\/20\d{2}\/\d{2}\/\d{2}/,
      /lightnovelstranslations\.com\/road-to-kingdom(?!\/)/,
    ],
    cb: openLinksFactory({
      selector: '.entry-content a',
      filterHref: /chapter/
    })
  }, {
    urls: [
      ///www\.asianhobbyist\.com\/[^\/]+(?:\/\d)?\/$/,
      /www\.sakuranovels\.com\/[^\/]+(?:\/\d)?\/$/
    ],
    cb() {
      const banner = document.getElementById('ezmobfooter');
      banner && (banner.style.display = 'none');
      const urlSplitLen = window.location.pathname.match(/[^\/]+/)[0].split('-').length;
      if (urlSplitLen !== 2) {
        const iframe = document.querySelector('div.post-embed iframe.wp-embedded-content');
        window.location.href = iframe
          ? iframe.src.replace(/embed.*/, '')
          : [...document.querySelectorAll('div.post-content > div.entry-content > p')].pop().innerText;
      } else {
        const prev = document.querySelector('.acp_previous_page  a');
        const next = document.querySelector('.acp_next_page  a');
        window.addEventListener('keyup', e => {
          if (!e.shiftKey) return
          switch (e.key) {
            case 'ArrowLeft':
              return prev && prev.click()
            case 'ArrowRight':
              return next && next.click()
          }
        });
      }
    }
  }, {
    urls: [
      /zmunjali.wordpress.com\/20\d{2}\/\d{2}\/\d{2}/,
    ],
    cb() {
      const links = Array.from(document.querySelectorAll('.entry-content a'));
      let link = links.shift();
      while (link && !/\(~’.’\)~/.test((link).innerHTML)) {
        link = links.shift();
      }
      if (!link) {
        link = Array.from(document.querySelectorAll('.entry-content p a')).pop();
      }
      const match = window.location.pathname.match(/part-(\d+)/);
      if (match && match[1]) {
        link.href += "#part" + match[1];
      }
      link.click();
    }
  }, {
    urls: [/zmunjali.wordpress.com\/[^/]+\/[^/]+chapter-\d+/],
    cb() {
      const { hash } = window.location;
      if (!hash) return;
      const match = /^#part(\d+)$/.exec(hash);
      if (!match) return;
      const part = match[1];
      const sections = [...document.querySelectorAll(".entry-content b")].filter(
        el => /Part \d/i.test(el.innerHTML)
      );
      const fraction = (part - 1) / part;
      sections[Math.ceil(sections.length * fraction)].scrollIntoView();
    }
  }, {
    urls: [
      /moonbunnycafe\.com\/[\w-]+-chapter-\d+/,
    ],
    cb: openLinksFactory({
      selector: '.entry-content a',
      filterText: /(chapter \d+|\d+(st|nd|rd|th) chapter|t?here!?)/i,
      filterHref: /-ch(apter)?/
    })
  }, {
    urls: [
      /kitakamiooi(?:.wordpress)?.com\/20\d{2}\/\d{2}\/\d{2}/,
      /isohungrytls.com\/(?:20\d{2}\/\d{2}|uncategorized)\//
    ],
    cb: openLinksFactory({
      selector: '.entry-content a, .entry a:not(.jp-relatedposts-post-a)',
      filterText: /(chapter|v\d+c\d+|(pro|epi)logue)/i
    })
  }, {
    urls: [/www.webnovel.com\/rssbook\/\d+\/\d+\/?$/],
    cb() {
      const link = document.querySelector('._ft.pa.l0.b0 > a');
      if (link.href.match(/^https?/)) {
        return link.click();
      }
      const observer = new MutationObserver(function (mutations) {
        mutations.forEach(m => {
          if (m.type === 'attributes' && m.attributeName === 'href') {
            m.target.click();
            this.disconnect();
          }
        });
      });
      observer.observe(link, { attributes: true });
    }
  }, {
    urls: [/bayabuscotranslation\.com\/20\d{2}\/\d{2}\/\d{2}/],
    cb() {
      if (!window.location.pathname.match(/\/\d\/$/)) {
        document.querySelector('.page-links a').click();
      }
    }
  }, {
    urls: [/zirusmusings\.com\/20\d{2}\//],
    cb: openLinksFactory({
      selector: '#resizeable-text a',
      filterText: /Read Chapter Here/
    })
  }, {
    urls: [
      /dsrealm\.com\/[^\/]*(?:news-and-chapter|chapter-\d+(?:-released)?)/,
      /dsrealmtranslations\.com\/reincarnated-as-a-dragons-egg\/dragon-egg-chapter-\d+/
    ],
    cb: openLinksFactory({
      selector: '.post-content .kswr-shortcode-element a',
      filterHref: /table-of-contents/
    })
  }, {
    urls: [/convallariaslibrary.com\/20\d{2}\/\d{2}\/\d{2}/,],
    cb: openLinksFactory({
      selector: '.post-content p a',
      filterHref: /convallariaslibrary.com\/translated/
    })
  }, {
    urls: [
      /fantranslationsblog.wordpress.com\/20\d{2}\/\d{2}\/\d{2}/,
      /www.blobtranslations.com\/sct-tfbnj-chapter-\d+/
    ],
    cb: openLinksFactory({
      selector: '.entry-content > p a, .entry-content > a',
      filterText: /Chapter/,
      filterHref: /(side-character-transmigrations-the-final-boss-is-no-joke|wp\.me)/,
    })
  }, {
    urls: [
      /lightnovelstranslations\.com\/[a-zA-Z0-9-]+-chapters?-\d+/,
    ],
    cb: openLinksFactory({
      selector: '.entry-content a',
      filterText: /CLICK HERE TO READ/
    })
  }, {
    urls: [/shikkakutranslations.org\/20\d{2}\/\d{2}\/\d{2}/],
    cb: openLinksFactory({
      selector: '.post .entry a',
      filterHref: /chapter-\d+\/$/,
    })
  }, {
    urls: [/entruce.wordpress.com\/20\d{2}\/\d{2}\/\d{2}/],
    cb: openLinksFactory({
      selector: '.entry-content a',
      filterText: /Chapter \d+$/,
      filterHref: /projects/,
    })
  }, {
    urls: [/lionmask.blogspot.com\/20\d{2}\/\d{2}\//],
    cb: openLinksFactory({
      selector: '.entry-content a',
      filterText: /Here's the (?:c|C)hapter/,
      filterHref: /lionmask.blogspot.com\/p\//,
    })
  }, {
    urls: [/scrya.org\/20\d{2}\/\d{2}\/\d{2}/,],
    cb: isSaved => {
      const chapterURL = n => `http://scrya.org/my-disciple-died-yet-again/disciple-chapter-${n}/`;
      const [start, end] = document.querySelector('.entry-title').innerText.match(/(\d+)/g).map(c => +c);
      const links = !end ? [chapterURL(start)] : [...Array(end - start + 1).keys()].map(i => i + start).map(c => chapterURL(c));
      return openURLs(links, isSaved)
    }
  }];

  for (const { urls, cb } of config) {
    let urlIndex = checkUrlInArray(urls);
    if (~urlIndex) {
      console.log(`SkipUpdates Usersript: Matched URL ${urls[urlIndex]}`);
      return typeof cb === "function" && cb(savedPage);
    }
  }
  console.log(`SkipUpdates Usersript: No URL matched`);
}).catch(console.error);
