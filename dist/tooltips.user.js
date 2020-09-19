// ==UserScript==
// @name           Novel Tooltips
// @namespace      http://tampermonkey.net/
// @version        0.1.1
// @author         You
// @description    try to take over the world!
// @match          http*://**/*
// @require        https://unpkg.com/@popperjs/core@2
// @require        https://unpkg.com/tippy.js@6
// @grant          unsafeWindow
// @noframes       
// ==/UserScript==
const regexConcat = (re1) => {
    const re1Str = typeof re1 === 'string' ? re1 : String(re1).slice(1, -1);
    return (re2) => {
        const re2Str = typeof re2 === 'string' ? re2 : String(re2).slice(1, -1);
        return new RegExp(re1Str + re2Str);
    };
};
const waybackify = (re) => {
    const reStr = String(re).slice(1, -1);
    return regexConcat(/(?:web.archive.org\/web\/\d+\/.*)?/)(reStr.replace(/(?:\\\/|$)/, '(:80)?\\/'));
};
const urlWithDate = (re) => regexConcat(re)(/\/20\d{2}\/\d{2}\/\d{2}/);
const zip = (xs, ys) => {
    const len = Math.min(xs.length, ys.length);
    return xs.slice(0, len).map((x, i) => [x, ys[i]]);
};
const compose = (f, g) => (x) => f(g(x));
const splitArrAtMid = (arr) => {
    const len = arr.length;
    if (len === 0)
        return [[], []];
    const mid = Math.ceil(len / 2);
    return [arr.slice(0, mid), arr.slice(mid)];
};
const identity = (x) => x;

const TOOLTIP_CLASSNAME = 'novel-tooltip';
const TOOLTIP_REPLACETEXT = `<span class='${TOOLTIP_CLASSNAME}'>$1</span>`;
const mapRegexToTooltip = (re) => (el) => {
    const existingTooltips = [...el.getElementsByClassName(TOOLTIP_CLASSNAME)];
    if (existingTooltips.length)
        return existingTooltips;
    // eslint-disable-next-line no-param-reassign
    el.innerHTML = el.innerHTML.replace(re, TOOLTIP_REPLACETEXT);
    const tooltips = [...el.getElementsByClassName(TOOLTIP_CLASSNAME)];
    return tooltips;
};
const mapRegexToTooltip1 = (re) => compose((els) => els.slice(0, 1), mapRegexToTooltip(re));
const getElements = ({ rootSelector: selector, filterFn, textSelector, }, mapRootsRe = null) => {
    let els = [...document.querySelectorAll(selector)];
    filterFn && (els = els.filter(filterFn));
    const roots = mapRootsRe
        ? els.flatMap(mapRegexToTooltip1(mapRootsRe))
        : els;
    const textEls = !textSelector
        ? []
        : [...document.querySelectorAll(textSelector)];
    return [roots, textEls];
};
const fetchDocument = (url) => fetch(url).then((res) => res.text().then((txt) => {
    const parser = new DOMParser();
    return parser.parseFromString(txt, 'text/html');
}));
const tooltipDefault = (elRoots, textRoots) => [elRoots, textRoots];
const tooltipSelectorSimilarSrcTgt = (roots) => {
    const [targets, textSources] = splitArrAtMid(roots);
    return [targets, textSources.map((el) => el.nextSibling)];
};
const tooltipMapTextEls = (mapper) => (roots, textEls) => [roots, textEls.map(mapper)];
const tooltipTgtUnnestParent = (levels) => {
    const extractParent = (el) => el.parentElement;
    const composeN = (fn, acc, n) => {
        if (n === 0)
            return acc;
        return composeN(fn, compose(fn, acc), n - 1);
    };
    const mapper = composeN(extractParent, identity, levels);
    return tooltipMapTextEls(mapper);
};
const tooltipGuardEmpty = (fn) => (roots, textNodes) => {
    if (roots.length === 0)
        return [[], []];
    return fn(roots, textNodes);
};
const extractTextFromTextEl = (el) => {
    if (typeof el === 'string')
        return el;
    if ('data' in el)
        return el.data;
    if ('innerHTML' in el) {
        return el.innerHTML;
    }
    return '';
};
const extractTextFromTextEls = (textEls) => textEls.map(compose((str) => str.trim(), extractTextFromTextEl));
const getTooltipData = async ({ selectorOpts: options, fn = tooltipDefault, mapRoots, }) => {
    try {
        const els = getElements(options, mapRoots);
        const [rootEls, textEls] = await Promise.resolve(fn(els[0], els[1]));
        return {
            els: {
                root: rootEls,
                text: textEls,
            },
            data: zip(rootEls, extractTextFromTextEls(textEls)),
        };
    }
    catch (e) {
        console.error(e);
        return {
            els: {
                root: [],
                text: [],
            },
            data: [],
        };
    }
};
getTooltipData.help = () => {
    console.log([
        'Argument is an object {re, selectorOpts, mapRoots, fn}',
        'selectorOpts is an object {selector, filterFn}',
    ].join('\n'));
};
const templates = [
    {
        re: [/holdxandclick.wordpress.com\/20\d{2}\/\d{2}\/\d{2}/],
        selectorOpts: {
            rootSelector: 'p strong',
            filterFn: (el) => /^\s*\(\d+\)\s*$/.test(el.innerText),
        },
        fn: (els) => {
            const firstText = els[0].innerText.trim();
            const text = [...document.querySelectorAll('p strong')]
                .map((el) => el.innerText.trim());
            const startI = text.findIndex((txt) => txt !== firstText && txt.startsWith(firstText));
            return [els, text.slice(startI).filter((_) => _)];
        },
    },
    {
        re: [/myoniyonitranslations.com\/[^/]+\/.+-chapter/],
        selectorOpts: {
            rootSelector: '.entry-content sup',
        },
        fn: tooltipSelectorSimilarSrcTgt,
    },
    {
        re: [/jingletranslations.wordpress.com\/20\d{2}\/\d{2}\/\d{2}/],
        selectorOpts: {
            rootSelector: '.entry-content sup a',
        },
        fn: (els) => {
            const text = els.flatMap((el) => {
                const el2 = document.getElementById(el.hash.slice(1));
                return el2 ? [el2.innerText] : [];
            });
            return [els, text];
        },
    },
    {
        re: [
            /sadhoovysinhumantranslations.wordpress.com\/novels\/[^/]+\/.+-chapter-/,
            /confusedtls.wordpress.com\/[^/]+-chapter/,
        ],
        selectorOpts: {
            rootSelector: '.entry-content a[href^="#section"]',
            textSelector: '.entry-content a[href^="#return"]',
        },
        fn: (els, textEls) => {
            const text = textEls.flatMap((el) => {
                const el2 = el.parentElement;
                return el2 ? [el2.innerHTML] : [];
            });
            return [els, text];
        },
    },
    {
        re: [/creativenovels.com\/128\/[^/]+-chapter/],
        selectorOpts: {
            rootSelector: '.entry-content p',
            filterFn: (el) => el.innerText.match(/{\d+}/) !== null,
        },
        fn: (els) => {
            const text = els.map((el) => el.innerHTML).pop();
            if (text === undefined)
                return [[], []];
            const texts = text.split('\n').slice(1);
            const spanEls = els.map((el) => {
                // eslint-disable-next-line no-param-reassign
                el.innerHTML = el.innerHTML.replace(/({\d+})/, TOOLTIP_REPLACETEXT);
                return el.getElementsByClassName(TOOLTIP_CLASSNAME)[0];
            });
            return [spanEls, texts];
        },
    }, {
        re: [/www.wuxiaworld.com\/novel\/[^/]+\/.+(?:(?:pro|epi)logue|chapter)/],
        selectorOpts: {
            rootSelector: 'span[id^="footnote-ref"] a',
        },
        fn: (els) => {
            const textEls = els.flatMap((el) => {
                const res = document.getElementById(el.hash.slice(1));
                return res ? [res] : [];
            });
            return [els, textEls];
        },
    }, {
        re: [/spicychickentranslations.wordpress.com\/novel-translations\/[^/]+\/.*(?:(?:pro|epi)logue|chapter)/],
        selectorOpts: {
            rootSelector: '.entry-content small a[href^="#t"] sup',
        },
        fn: (els) => {
            const rootEls = els.flatMap((e) => {
                const p = e.parentElement;
                return p ? [p] : [];
            });
            const textEls = rootEls.map((e) => (document.getElementsByName(e.hash.slice(1))[0].nextElementSibling));
            return [rootEls, textEls];
        },
    }, {
        re: [/www.cookienovels.com\/novel\/[^/]+\/(?:chapter|(?:epi|pro)logue)/],
        selectorOpts: {
            rootSelector: '.entry-content a[href*="/glossary/"]',
        },
        fn: async (els) => {
            const rootEls = els;
            const textEls = rootEls.map((e) => fetchDocument(e.href)
                .then((doc) => [...doc.querySelectorAll('#main .entry-content p span')]
                .reduce((acc, el) => acc + el.parentElement.outerHTML, '')));
            return [rootEls, await Promise.all(textEls)];
        },
    }, {
        re: [/scrya.org\/[^/]+\/[\w-]+-chapter/],
        selectorOpts: {
            rootSelector: '.entry-content p',
            filterFn: (p) => /[⁰¹²³⁴⁵⁶⁷⁸⁹]+/.test(p.innerText),
            textSelector: '.entry-content ol li',
        },
        mapRoots: /([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/,
        fn(roots, textEls) {
            const xs = roots.length ? roots : [...document.querySelectorAll('.entry-content p sup')];
            return [xs, textEls];
        },
    },
    {
        re: [
            /jiamintranslation.com\/20\d{2}\/\d{2}\/\d{2}/,
            /(silentmoontranslationscom|piperpickups).wordpress.com\/20\d{2}\/\d{2}\/\d{2}/,
        ],
        selectorOpts: {
            rootSelector: '.entry-content a[href*="#fn"]',
            textSelector: '.entry-content a[href*="#ref"]',
        },
        fn: tooltipTgtUnnestParent(2),
    }, {
        re: [/volarenovels.com\/[^/]+\/[\w-]+-chapter/],
        selectorOpts: {
            rootSelector: '.entry-content a[href*="#fn-"]',
            textSelector: '.entry-content a[href*="#fnref-"]',
        },
        fn: tooltipTgtUnnestParent(3),
    }, {
        re: [/experimentaltranslations.com\/20\d{2}\/\d{2}\/\d{2}/],
        selectorOpts: {
            rootSelector: '.entry-content p',
            filterFn: (p) => /[⁰¹²³⁴⁵⁶⁷⁸⁹]+/.test(p.innerText),
            textSelector: '.entry-content p',
            textFilter: (el) => el.innerText.match(/^[0-9]\. /) !== null,
        },
        mapRoots: /([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/,
    }, {
        re: [/www.radianttranslations.com\/[^/]+\/[\w-]+-chapter/],
        selectorOpts: {
            rootSelector: '.entry-content a[href*="#fn-"]',
            textSelector: '.entry-content a[href*="#fnref-"]',
        },
        fn: tooltipTgtUnnestParent(2),
    }, {
        re: [/d3wynightunr0lls\.wordpress\.com\/20\d{2}\/\d{2}\/\d{2}\/[^/]+-chapter-\d+/],
        selectorOpts: {
            rootSelector: '.entry-content p sup',
            filterFn: (el) => el.innerText.match(/(\[|{)\d+(\]|})/) !== null,
            textSelector: '.entry-content p',
            textFilter: (el) => el.innerText.match(/^(\[|{)\d+(\]|})/) !== null,
        },
    },
    {
        re: [/www.wuxiaworld.co\/[^/]+\/\d+.html/],
        selectorOpts: {
            rootSelector: '#content',
        },
        fn([root]) {
            const tooltipRe = /(\(\d+\))/;
            const text = [...root.childNodes].filter((el) => el.constructor === Text
                && el.data.match(regexConcat('^')(tooltipRe)));
            const tiproots = mapRegexToTooltip(new RegExp(tooltipRe, 'g'))(root);
            return [tiproots, text];
        },
    }, {
        re: [urlWithDate('letsyuri.wordpress.com')],
        selectorOpts: {
            rootSelector: '.entry-content p',
            filterFn: (el) => /(\[[0-9]+\])/.test(el.innerText),
        },
        fn: tooltipGuardEmpty((roots) => {
            const lastRootIndex = roots.length - 1;
            const tooltipText = roots[lastRootIndex].innerText;
            const neededText = tooltipText.slice(tooltipText.indexOf('['));
            const lines = neededText.split(/\n(?=\[\d+\])/);
            let [rootsInit, textLines] = [roots.slice(0, lastRootIndex), lines];
            if (lines.length < lastRootIndex - 1) {
                const tipTextIndex = roots.findIndex((el) => /^(?=\[\d+\])/.test(el.innerText));
                [rootsInit, textLines] = [roots.slice(0, tipTextIndex), roots.slice(tipTextIndex)];
            }
            const rootTooltips = rootsInit.flatMap(mapRegexToTooltip(/(\[[0-9]+\])/g));
            const tooltipNumbers = rootTooltips.map((span) => span.innerText);
            return [rootTooltips, textLines.filter((t) => {
                    const txt = extractTextFromTextEl(t);
                    return tooltipNumbers.some((n) => txt.includes(n));
                })];
        }),
    },
    {
        re: [/foxaholic\.com\/novel\/[^/]+\/(chapter|(epi|pro)logue)/],
        selectorOpts: {
            rootSelector: "a[name^='_ftn']",
        },
        fn: tooltipSelectorSimilarSrcTgt,
    },
    {
        re: [/www\.novicetranslations\.com\/[-a-zA-Z]+((epi|pro)logue|chapter-\d+\/?$)/],
        selectorOpts: {
            rootSelector: '.entry-content span[data-mfn]',
            textSelector: 'hr.wp-block-separator',
        },
        fn: tooltipGuardEmpty((roots, textRoots) => {
            const textListEl = textRoots[0].nextElementSibling;
            if (!textListEl)
                return [[], []];
            return [roots, [...textListEl.getElementsByTagName('li')]];
        }),
    },
    {
        re: [/brokenjinsei.com\/[^/]+-chapter-\d+/],
        selectorOpts: {
            rootSelector: 'a[id^="tag_"]',
            textSelector: 'a[href^="#tag_"]',
        },
        fn: tooltipMapTextEls((el) => el.parentElement),
    },
    {
        re: [urlWithDate('starrynightnovels.com')],
        selectorOpts: {
            rootSelector: '.entry-content p > sup',
        },
        fn: tooltipGuardEmpty((all) => {
            const [root, textNodes] = splitArrAtMid(all);
            return [root, textNodes.map((el) => el.parentElement)];
        }),
    },
];
(async () => {
    unsafeWindow.userscripts = unsafeWindow.userscripts || {};
    unsafeWindow.userscripts.tooltips = {
        print() {
            console.log(this.vars);
        },
        getEls: getElements,
        getData: getTooltipData,
        vars: {},
    };
    const t = templates.find((t_) => t_.re.find((r) => waybackify(r).test(window.location.href)));
    if (!t)
        return console.log('Tooltip Userscript: No URL matched');
    const { data, els } = await getTooltipData(t);
    unsafeWindow.userscripts.tooltips.vars = {
        elements: data.map(([x]) => x),
        elementText: data.map(([_, x]) => x),
    };
    const tooltips = data.map(([el, txt]) => [el, tippy(el, {
            content: txt,
            interactive: true,
            allowHTML: true,
            size: 'large',
        })]);
    console.group('Tooltip Userscript');
    console.log(`${tooltips.length} tooltips enabled`);
    console.log('Roots', els.root);
    console.log('Text Src', els.text);
    console.groupEnd();
    window.addEventListener('keyup', (e) => {
        if (e.altKey && e.key === '/') {
            tooltips.forEach(([el]) => {
                // eslint-disable-next-line no-underscore-dangle
                const tooltip = el._tippy;
                const { offsetTop } = el;
                if (!(offsetTop < window.scrollY
                    && offsetTop > window.scrollY - window.innerHeight))
                    return;
                tooltip.show();
                setTimeout(tooltip.hide, 5000);
            });
        }
    });
    return null;
})().catch(console.error);
