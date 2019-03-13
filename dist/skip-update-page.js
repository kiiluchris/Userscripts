const regexConcat = re1 => {
    const re1Str = typeof re1 === "string" ? re1 : String(re1).slice(1,-1);
    return re2 => {
        const re2Str = typeof re2 === "string" ? re2 : String(re2).slice(1,-1);
        return new RegExp(re1Str + re2Str)
    }
};

const waybackify = re => {
    const reStr = String(re).slice(1,-1);
    return regexConcat(/(?:web.archive.org\/web\/\d+\/.*)?/)(reStr.replace(/(?:\\\/|$)/, "(:80)?\\\/"))
};

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


const EXTENSION_NAME = 'Comic Manager';
const linkTemplates = {
  kuronomaou: {
    options: {
      selector: '.entry-content a:not(.jp-relatedposts-post-a)',
      filterText: /Chapter \d+$/,
    },
    mapper({url, text}) {
      const chapterNum = text.match(/Chapter (\d+)$/)[1];
      return `https://entruce.wordpress.com/projects/knm-chapters/knm-chapter-${chapterNum}/`
    }
  }
};
unsafeWindow.userscripts = unsafeWindow.userscripts || {};
unsafeWindow.userscripts.skipUpdates = {
  processPages(options) {
    return (templateFn) => {
      return getLinks(options).map(l => ({
        href: templateFn({url: l.href, text: l.innerText})
      }))
    }
  },
  openPages(options){
    return (templateFn) => {
      const linkURLs = this.processPages(options)(templateFn);
      return openLinks([{click(){}}, ...linkURLs], false);
    }
  },
  processPagesFromTemplate(templateName){
    if(!linkTemplates[templateName]) throw new Error(`Template for "${templateName}" does not exist`)
    const {options, mapper} = linkTemplates[templateName];
    return this.processPages(options)(mapper);
  },
  openPagesFromTemplate(templateName){
    const linkURLs = this.processPagesFromTemplate(templateName);
    return openLinks([{click(){}}, ...linkURLs], false);
  },
  getLinks,
  openURLs,
  openURLsInRange(urlFn){
    return (start, end, isSaved = false) => {
      const urls = [...Array(end - start + 1).keys()].map(offset => urlFn(start + offset));
      return openURLs(urls, isSaved)
    }
  }
};

function checkUrlInArray(urls){
  if(!Array.isArray(urls)){
    throw new Error("Array of url regex to match not provided");
  }

  return urls.findIndex(u => waybackify(u).test(window.location.href));
}

const getMessageFromExtension = status => new Promise(res => {
  window.addEventListener("message", ({data:{extension, status:s}}) => {
    if(extension === 'Comic Manager' && status === s){
      res(true);
    }
  });
});

const windowLoaded = new Promise(res => {
  window.addEventListener("load", e => {
    res(false);
  });
});


const savePage = async (url) => {
  let timeoutID;
  const isPageSaved = await new Promise(res => {
    const extension = 'Comic Manager';
    const listenForMessageConfirm = ({data:{message, extensionName}}) => {
      if(extension === extensionName && `Saved: ${url}` === message){
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

  if(!isPageSaved) {
    throw new Error(`Save page failed: URL ${url} not saved`);
    alert('Skipper: Timed out');
  }
};

function getLinks({elements, selector, filterHref, filterText, condition}) {
  if((!selector && !elements) || (condition && !condition())) return [];
  let links = [...(selector ? document.querySelectorAll(selector) : elements)];
  if(filterHref){
    links = links.filter(el => filterHref.test(el.href));
  }
  if(filterText){
    links = links.filter(el => filterText.test(el.innerText));
  }
  return console.log(links) || links;
}async function openLinks (links, isSaved){
  if(!links.length) return false;
  const [first, ...rest] = links;
  if(!isSaved) rest.reverse();
  for(const link of rest){
    if(isSaved) await savePage(link.href);
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
  const links = urls.map(u => ({href: u}));
  links.unshift({
    click(){
      const link = document.createElement('a');
      link.href = firstUrl;
      isSaved && link.addEventListener('click', function(e){
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
const openLinksFactory = (options) => (
  (isSaved) => {
    const links = getLinks(options);
    return openLinks(links, isSaved)
  }
);

const clickElSetup = selector => () => document.querySelector(selector).click();

Promise.race([getMessageFromExtension("loading"), windowLoaded]).then(async savedPage => {
  if(savedPage){
    await getMessageFromExtension("complete");
  }
  const config = [{
    urls: [/jigglypuffsdiary.com/],
    cb(){
      let select = window.jQuery('div.wp_user_stylesheet_switcher select');
      select.val("1");
      select.trigger("change");
    }
  }, {
    urls: [
      /starrydawntranslations.wordpress.com\/20\d{2}\/\d{2}\/\d{2}/,
      /re-library.com\/20\d{2}\/\d{2}\/\d{2}/,
      /infinitenoveltranslations.net\/summoned-slaughterer-chapter-\d+/,
      /slothtranslations\.com\/20\d{2}\/\d{2}\/\d{2}/,
      /bcatranslation.com\/20\d{2}\/\d{2}\/\d{2}/,
      /praisethemetalbat.wordpress.com\/20\d{2}\/\d{2}\/\d{2}/,
      /sleepykorean.wordpress.com\/20\d{2}\/\d{2}\/\d{2}/,
      /yurikatrans.xyz\/uncategorized/,
      /volarenovels.com\/[\w-]+-chapter/,
      /tenshihonyakusha.wordpress.com\/20\d{2}\/\d{2}\/\d{2}/,
    ],
    cb(){
      document.querySelector('.entry-content a').click();
    }
  }, {
    urls: [/bananachocolatecosmos.wordpress.com\/20\d{2}\/\d{2}\/\d{2}/, /novelsnchill\.com\/[^\/]+-chapter-\d+-release/],
    cb: clickElSetup('.entry-content a[href*="chapter"]')
  }, {
    urls: [/novelsformy.blogspot.com\/20\d{2}\/\d{2}/],
    cb: clickElSetup('.entry-content a[href*="/p/"]')
  },{
    urls: [
      /rebirth\.online\/20\d{2}\/\d{2}\/\d{2}/,
      /www.wuxiaworld\.com\/[^\/]+chapter/,
    ],
    cb(){
      Array.from(document.querySelectorAll('.entry-content a')).pop().click();
    }
  },{
    urls: [
      /funwithstela.web.id\/20\d{2}\/\d{2}\/\d{2}\/[^\/]+-\d+-2/
    ],
    cb: openLinksFactory({
      selector: '.post-content p a:not([title])',
      filterText: /^(chapter|chp?) \d+$/i
    })
  },{
    urls: [
      //butterflyscurse.stream\/[^\/]+-\d+\/?$/
    ],
    async cb(isSaved){
      const els = [...document.querySelectorAll('.entry-content a[href*="table-of-contents"]')];
      const chapters = els.map(el => "Chapter " + el.innerText.match(/\d+/)[0]);
      const end = els[0].href.slice(0,-1).lastIndexOf('/');
      const tocURL = els[0].href.slice(0, end);
      const doc = await new Promise(res => {
          const req = new XMLHttpRequest();
          req.responseType = 'document';
          req.addEventListener('load', ({target:{response:doc}}) => res(doc));
          req.open('GET', tocURL);
          req.send(null);
      });
      const links = [...doc.querySelectorAll('.entry-content details a[href*="table-of-contents"]')]
          .filter(el => chapters.includes(el.innerText))
          .map(el => el.href);
      return openURLs(links, isSaved)
    }
  },{
    urls: [/radianttranslations.com\/20\d{2}\/\d{2}\/\d{2}/],
    cb: openLinksFactory({
      selector: '.entry-content a:not([title])',
      filterHref:  /(?!20\d{2}\/\d{2}\/\d{2}\/).+chapter/
    })
  },{
    urls: [/arkmachinetranslations.wordpress.com\/20\d{2}\/\d{2}\/\d{2}/],
    cb: openLinksFactory({
      selector: '.entry-content  a',
      filterHref:  /index\/./
    })
  },{
    urls: [
      /oppatranslations.com\/20\d{2}\/\d{2}\/\d{2}/,
      /rottentranslations.com\/20\d{2}\/\d{2}\/\d{2}/,
      /ktlchamber.wordpress.com\/20\d{2}\/\d{2}\/\d{2}/,
      /wordexcerpt.com\/[\w-]*(?:chapter|(?:epi|pro)logue)/,
      //plumlizi.com\/20\d{2}\/\d{2}\/\d{2}/,
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
    cb(){
      const banner = document.getElementById('ezmobfooter');
      banner && (banner.style.display = 'none');
      const urlSplitLen = window.location.pathname.match(/[^\/]+/)[0].split('-').length;
      if(urlSplitLen !== 2){
        const iframe = document.querySelector('div.post-embed iframe.wp-embedded-content');
        window.location.href = iframe
          ? iframe.src.replace(/embed.*/, '')
        : [...document.querySelectorAll('div.post-content > div.entry-content > p')].pop().innerText;
      } else {
        const prev = document.querySelector('.acp_previous_page  a');
        const next = document.querySelector('.acp_next_page  a');
        window.addEventListener('keyup', e => {
          if(!e.shiftKey) return
          switch(e.key){
            case 'ArrowLeft':
              return prev && prev.click()
            case 'ArrowRight':
              return next && next.click()
          }
        });
      }
    }
  },{
    urls: [
      /zmunjali.wordpress.com\/20\d{2}\/\d{2}\/\d{2}/,
    ],
    cb(){
      const links = Array.from(document.querySelectorAll('.entry-content a'));
      let link = links.shift();
      while(link && !/\(~’.’\)~/.test((link).innerHTML)){
        link = links.shift();
      }
      if(!link){
        link = Array.from(document.querySelectorAll('.entry-content p a')).pop();
      }
      const match = window.location.pathname.match(/part-(\d+)/);
      if(match && match[1]){
        link.href += "#part" + match[1];
      }
      link.click();
    }
  },{
    urls: [/zmunjali.wordpress.com\/[^/]+\/[^/]+chapter-\d+/],
    cb(){
      const {hash} = window.location;
      if(!hash) return;
      const match = /^#part(\d+)$/.exec(hash);
      if(!match) return;
      const part = match[1];
      const sections = [...document.querySelectorAll(".entry-content b")].filter(
        el => /Part \d/i.test(el.innerHTML)
      );
      const fraction = (part - 1) / part;
      sections[Math.ceil(sections.length * fraction)].scrollIntoView();
    }
  },{
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
      /isohungrytls.com\/20\d{2}\/\d{2}\//
    ],
    cb: openLinksFactory({
      selector: '.entry-content a, .entry a:not(.jp-relatedposts-post-a)',
      filterText: /(chapter|v\d+c\d+|(pro|epi)logue)/i
    })
  },{
    urls: [/www.webnovel.com\/rssbook\/\d+\/\d+\/?$/],
    cb(){
      const link = document.querySelector('._ft.pa.l0.b0 > a');
      if(link.href.match(/^https?/)){
        return link.click();
      }
      const observer = new MutationObserver(function(mutations){
        mutations.forEach(m => {
          if(m.type === 'attributes' && m.attributeName === 'href'){
            m.target.click();
            this.disconnect();
          }
        });
      });
      observer.observe(link, {attributes: true});
    }
  }, {
    urls: [/bayabuscotranslation\.com\/20\d{2}\/\d{2}\/\d{2}/],
    cb(){
      if(!window.location.pathname.match(/\/\d\/$/)){
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
      filterHref:  /table-of-contents/
    })
  },{
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
  },{
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
    urls: [ /scrya.org\/20\d{2}\/\d{2}\/\d{2}/, ],
    cb: isSaved => {
      const chapterURL = n => `http://scrya.org/my-disciple-died-yet-again/disciple-chapter-${n}/`;
      const [start, end] = document.querySelector('.entry-title').innerText.match(/(\d+)/g).map(c => +c);
      const links = !end ? [chapterURL(start)] : [...Array(end - start + 1).keys()].map(i => i + start).map(c => chapterURL(c));
      return openURLs(links, isSaved)
    }
  }];

  for(const {urls, cb} of config){
    let urlIndex = checkUrlInArray(urls);
    if(~urlIndex){
      console.log(`SkipUpdates Usersript: Matched URL ${urls[urlIndex]}`);
      return typeof cb === "function" && cb(savedPage);
    }
  }
  console.log(`SkipUpdates Usersript: No URL matched`);
}).catch(console.error);
