// ==UserScript==
// @name           Swap BoxNovel and VipNovel
// @namespace      http://tampermonkey.net/
// @version        0.1
// @author         You
// @description    try to take over the world!
// @include        /(box|vip)novel\.com\/(vip)?novel\/.*/
// @grant          none
// ==/UserScript==
const boxNovelDomain = 'boxnovel';
const vipNovelDomain = 'vipnovel';
const SCRIPT_NAME = 'Swap BoxNovel and VipNovel Userscript';
const formatterForDomain = (domain) => {
    const formatters = [];
    return {
        add: (re, formatter) => {
            formatters.push({ re, formatter });
        },
        format: (url) => {
            const formatter = formatters.find((f) => {
                if (typeof f.re === 'string') {
                    return url.includes(f.re);
                }
                return f.re.test(url);
            });
            return (formatter && formatter.formatter[domain](url)) || url;
        },
    };
};
const findUrlDomain = (url, ...fns) => {
    if (!fns.length)
        throw new Error('No url matching functions provided to findUrlDomain(url, ...fns)');
    const match = fns.find((fn) => !!fn(url));
    return match ? match(url) : null;
};
function isNovelDetailsPage() {
    const { pathname } = window.location;
    const pathSegments = pathname.split('/').filter((seg) => seg);
    return ((pathname.startsWith('/novel')
        || pathname.startsWith('/vipnovel')) && pathSegments.length === 2);
}
(() => {
    const isUrlOfDomain = (domain) => ((url) => (url.includes(domain) ? domain : null));
    const isUrlOfBoxNovel = isUrlOfDomain(boxNovelDomain);
    const isUrlOfVipNovel = isUrlOfDomain(vipNovelDomain);
    const url = window.location.href;
    if (isNovelDetailsPage()) {
        window.addEventListener('load', (_) => {
            const chapterList = document.querySelector('ul.main');
            if (!chapterList)
                return;
            chapterList.scrollIntoView(true);
        });
    }
    const domain = findUrlDomain(url, isUrlOfBoxNovel, isUrlOfVipNovel);
    if (!domain)
        return console.log(SCRIPT_NAME, 'Domain not found');
    console.log(SCRIPT_NAME, `Domain is ${domain}`);
    const urlUpdaters = {
        boxnovel: (u) => u.replace('-webnovel', '').replace(/(?:box)?novel/g, 'vipnovel'),
        vipnovel: (u) => u.replace('vipnovel', 'boxnovel').replace('vipnovel', 'novel'),
    };
    const urlUpdater = urlUpdaters[domain];
    const urlFormatter = formatterForDomain(domain);
    urlFormatter.add('experimental-log', {
        boxnovel: (u) => u.replace('the-experimental', 'experimental'),
        vipnovel: (u) => u.replace('experimental', 'the-experimental'),
    });
    window.addEventListener('keydown', (e) => {
        var _a;
        if (e.ctrlKey && e.shiftKey && e.key === 'ArrowUp') {
            window.location.href = urlFormatter.format(urlUpdater(url));
        }
        else if (e.shiftKey && e.key.toUpperCase() === 'L') {
            (_a = document.querySelector('ul.main > li > a')) === null || _a === void 0 ? void 0 : _a.click();
        }
    });
    return undefined;
})();
