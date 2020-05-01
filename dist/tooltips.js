const regexConcat = (re1) => {
    const re1Str = typeof re1 === "string" ? re1 : String(re1).slice(1, -1);
    return (re2) => {
        const re2Str = typeof re2 === "string" ? re2 : String(re2).slice(1, -1);
        return new RegExp(re1Str + re2Str);
    };
};
const waybackify = (re) => {
    const reStr = String(re).slice(1, -1);
    return regexConcat(/(?:web.archive.org\/web\/\d+\/.*)?/)(reStr.replace(/(?:\\\/|$)/, "(:80)?\\\/"));
};
const zip = (xs, ys) => {
    const len = Math.min(xs.length, ys.length);
    return xs.slice(0, len).map((x, i) => [x, ys[i]]);
};

// ==UserScript==
// @name         Novel Tooltips
// @namespace    http://tampermonkey.net/
// @version      0.1.1
// @description  try to take over the world!
// @author       You
// @match        http*://**/*
// @noframes
// @require      https://unpkg.com/tippy.js@3/dist/tippy.all.min.js
// @grant        unsafeWindow
// ==/UserScript==


const TOOLTIP_CLASSNAME = 'novel-tooltip';
const TOOLTIP_REPLACETEXT = `<span class='${TOOLTIP_CLASSNAME}'>$1</span>`;

const mapRegexToTooltip = (re, getAll = false) => el => {
  const existingTooltips = [...el.getElementsByClassName(TOOLTIP_CLASSNAME)];
  if (existingTooltips.length)
    return getAll ? existingTooltips : existingTooltips[0]
  el.innerHTML = el.innerHTML.replace(re, TOOLTIP_REPLACETEXT);
  const tooltips = [...el.getElementsByClassName(TOOLTIP_CLASSNAME)];
  return getAll ? tooltips : tooltips[0]
};

const getElements = ({ selector, filterFn = _ => _ }, mapRootsRe = null) => {
  const els = [...document.querySelectorAll(selector)]
    .filter(filterFn);
  const roots = mapRootsRe
    ? els.map(mapRegexToTooltip(mapRootsRe))
    : els;
  return [roots]
};

const fetchDocument = url => new Promise(resolve => {
  const req = new XMLHttpRequest();
  req.responseType = 'document';
  req.addEventListener('load', ({ target: { response } }) => {
    resolve(response);
  });
  req.open('GET', url);
  req.send();
});

const getTooltipData = async ({ selectorOpts: options, fn, mapRoots }) => {
  try {
    const els = getElements(options, mapRoots);
    const [rootEls, textEls] = await Promise.resolve(fn(...els));
    return zip(rootEls, textEls.map(el => (el.innerHTML || el.data || el).trim()));
  } catch (e) {
    console.error(e);
    return [];
  }
};
getTooltipData.help = () => {
  console.log([
    "Argument is an object {re, selectorOpts, mapRoots, fn}",
    "selectorOpts is an object {selector, filterFn}"
  ].join("\n"));
};

const templates = [
  {
    re: [/holdxandclick.wordpress.com\/20\d{2}\/\d{2}\/\d{2}/],
    selectorOpts: {
      selector: 'p strong',
      filterFn: el => /^\s*\(\d+\)\s*$/.test(el.innerText),
    },
    fn: (els) => {
      const firstText = els[0].innerText.trim();
      const text = [...document.querySelectorAll('p strong')]
        .map(el => el.innerText.trim());
      const startI = text.findIndex(txt => {
        return txt != firstText && txt.startsWith(firstText);
      });
      return [els, text.slice(startI).filter(_ => _)]
    }
  }, {
    re: [/myoniyonitranslations.com\/[^\/]+\/.+-chapter/],
    selectorOpts: {
      selector: '.entry-content sup',
    },
    fn: (els) => {
      const mid = els.length / 2;
      const text = els.slice(mid)
        .map(el => el.nextSibling.data);

      return [els.slice(0, mid), text];
    }
  }, {
    re: [/jingletranslations.wordpress.com\/20\d{2}\/\d{2}\/\d{2}/],
    selectorOpts: {
      selector: '.entry-content sup a',
    },
    fn: (els) => {
      const text = els.map(el => document.getElementById(el.hash.slice(1)))
        .map(el => el.innerText);

      return [els, text];
    }
  }, {
    re: [
      /sadhoovysinhumantranslations.wordpress.com\/novels\/[^\/]+\/.+-chapter-/,
      /confusedtls.wordpress.com\/[^\/]+-chapter/,
    ],
    selectorOpts: {
      selector: '.entry-content a[href^="#section"]',
    },
    fn: els => {
      const text = [...document.querySelectorAll('.entry-content a[href^="#return"]')]
        .map(el => el.parentElement.innerHTML);
      return [els, text]
    }
  }, {
    re: [/creativenovels.com\/128\/[^\/]+-chapter/],
    selectorOpts: {
      selector: '.entry-content p',
      filterFn: el => el.innerText.match(/{\d+}/)
    },
    fn: els => {
      const text = els.map(el => el.innerHTML).pop().split('\n').slice(1);
      const spanEls = els.map(el => {
        el.innerHTML = el.innerHTML.replace(/({\d+})/, TOOLTIP_REPLACETEXT);
        return el.getElementsByClassName(TOOLTIP_CLASSNAME)[0]
      });
      return [spanEls, text];
    }
  }, {
    re: [/www.wuxiaworld.com\/novel\/[^\/]+\/.+(?:(?:pro|epi)logue|chapter)/],
    selectorOpts: {
      selector: 'span[id^="footnote-ref"] a'
    },
    fn: els => {
      const textEls = els.map(el => document.getElementById(el.hash.slice(1)));
      return [els, textEls];
    }
  }, {
    re: [/spicychickentranslations.wordpress.com\/novel-translations\/[^\/]+\/.*(?:(?:pro|epi)logue|chapter)/],
    selectorOpts: {
      selector: '.entry-content small a[href^="#t"] sup',
    },
    fn: els => {
      const rootEls = els.map(e => e.parentElement);
      const textEls = rootEls.map(e => document.getElementsByName(e.hash.slice(1))[0].nextElementSibling);
      return [rootEls, textEls];
    }
  }, {
    re: [/www.cookienovels.com\/novel\/[^\/]+\/(?:chapter|(?:epi|pro)logue)/],
    selectorOpts: {
      selector: '.entry-content a[href*="/glossary/"]',
    },
    fn: async els => {
      const rootEls = els;
      const textEls = rootEls.map(e =>
        fetchDocument(e.href)
          .then(doc => [...doc.querySelectorAll('#main .entry-content p span')]
            .reduce((acc, el) => acc + el.parentElement.outerHTML, "")));
      return [rootEls, await Promise.all(textEls)];
    }
  }, {
    re: [/scrya.org\/[^\/]+\/[\w-]+-chapter/],
    selectorOpts: {
      selector: '.entry-content p',
      filterFn: p => /[⁰¹²³⁴⁵⁶⁷⁸⁹]+/.test(p.innerText),
    },
    mapRoots: /([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/,
    fn(roots) {
      const textEls = [...document.querySelectorAll('.entry-content ol li')];
      const xs = roots.length ? roots : [...document.querySelectorAll('.entry-content p sup')];
      return [xs, textEls]
    }
  }, {
    re: [
      /jiamintranslation.com\/20\d{2}\/\d{2}\/\d{2}/,
      /(silentmoontranslationscom|piperpickups).wordpress.com\/20\d{2}\/\d{2}\/\d{2}/,
    ],
    selectorOpts: {
      selector: '.entry-content a[href*="#fn"]'
    },
    fn(els) {
      const textEls = [...document.querySelectorAll('.entry-content a[href*="#ref"]')]
        .map(el => el.parentElement.parentElement);
      return [els, textEls]
    }
  }, {
    re: [/volarenovels.com\/[^\/]+\/[\w-]+-chapter/],
    selectorOpts: {
      selector: '.entry-content a[href*="#fn-"]'
    },
    fn(els) {
      const textEls = [...document.querySelectorAll('.entry-content a[href*="#fnref-"]')]
        .map(el => el.parentElement.parentElement.parentElement);
      return [els, textEls]
    }
  }, {
    re: [/experimentaltranslations.com\/20\d{2}\/\d{2}\/\d{2}/],
    selectorOpts: {
      selector: '.entry-content p',
      filterFn: p => /[⁰¹²³⁴⁵⁶⁷⁸⁹]+/.test(p.innerText),
    },
    mapRoots: /([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/,
    fn(roots) {
      const textEls = [...document.querySelectorAll('.entry-content p')]
        .filter(el => el.innerText.match(/^[0-9]\. /));
      return [roots, textEls]
    }
  }, {
    re: [/www.radianttranslations.com\/[^\/]+\/[\w-]+-chapter/],
    selectorOpts: {
      selector: '.entry-content a[href*="#fn-"]'
    },
    fn(els) {
      const textEls = [...document.querySelectorAll('.entry-content a[href*="#fnref-"]')]
        .map(el => el.parentElement.parentElement);
      return [els, textEls]
    }
  }, {
    re: [/d3wynightunr0lls\.wordpress\.com\/20\d{2}\/\d{2}\/\d{2}\/[^\/]+-chapter-\d+/,],
    selectorOpts: {
      selector: '.entry-content p sup',
      filterFn: el => el.innerText.match(/(\[|{)\d+(\]|})/),
    },
    fn(els) {
      const textEls = [...document.querySelectorAll('.entry-content p')]
        .filter(el => el.innerText.match(/^(\[|{)\d+(\]|})/));
      return [els, textEls]
    }
  }, {
    re: [/www.wuxiaworld.co\/[^\/]+\/\d+.html/],
    selectorOpts: {
      selector: '#content',
    },
    fn([root]) {
      const tooltipRe = /(\(\d+\))/;
      const text = [...root.childNodes].filter(el => el.constructor === Text && el.data.match(regexConcat("^")(tooltipRe)));
      const tiproots = mapRegexToTooltip(new RegExp(tooltipRe, 'g'), true)(root);
      return [tiproots, text]
    }
  }
];
 (async function () {

  unsafeWindow.userscripts = unsafeWindow.userscripts || {};
  unsafeWindow.userscripts.tooltips = {
    print() {
      console.log(this.vars);
    },
    getEls: getElements,
    getData: getTooltipData,
    vars: {}
  };
  const t = templates.find(t => t.re.find(r => {
    return waybackify(r).test(window.location.href)
  }));
  if (!t) return console.log("Tooltip Userscript: No URL matched");
  const data = await getTooltipData(t);
  unsafeWindow.userscripts.tooltips.vars = {
    elements: data.map(([x]) => x),
    elementText: data.map(([_, x]) => x)
  };
  const tooltips = data.map(([el, txt], i) =>
    [el, tippy(el, {
      content: txt,
      interactive: true,
      allowHTML: true,
      size: 'large',
    })]
  );
  console.log(`Tooltip Userscript: ${tooltips.length} tooltips enabled`);
  window.addEventListener('keyup', e => {
    if (e.altKey && e.key === '/') {
      tooltips.forEach(([el]) => {
        const tooltip = el._tippy;
        const { offsetTop } = el;
        if (!(offsetTop < window.scrollY && offsetTop > window.scrollY - window.innerHeight)) return
        tooltip.show();
        setTimeout(tooltip.hide, 5000);
      });
    }
  });
})().catch(console.error);
