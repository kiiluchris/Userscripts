// ==UserScript==
// @name         Switch BoxNovel and VipNovel
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @include      /(box|vip)novel\.com\/(vip)?novel\/.*/
// @grant        none
// ==/UserScript==

(function () {
  const boxNovelDomain = 'boxnovel';
  const vipNovelDomain = 'vipnovel';
  const isUrlOfDomain = domain => url => url.includes(domain) ? domain : undefined;
  const isUrlOfBoxNovel = isUrlOfDomain(boxNovelDomain);
  const isUrlOfVipNovel = isUrlOfDomain(vipNovelDomain);
  const findUrlDomain = (url, ...fns) => {
    if (!fns.length) throw "No url matching functions provided to findUrlDomain(url, ...fns)"
    for (const fn of fns) {
      const domain = fn(url);
      if (domain) {
        return domain
      }
    }
  };
  const urlUpdaters = {
    [boxNovelDomain]: url => url.replace('-webnovel', '').replace(/(?:box)?novel/g, 'vipnovel'),
    [vipNovelDomain]: url => url.replace('vipnovel', 'boxnovel').replace('vipnovel', 'novel'),
  };

  const url = window.location.href;
  const domain = findUrlDomain(url, isUrlOfBoxNovel, isUrlOfVipNovel);
  const urlUpdater = urlUpdaters[domain];
  window.addEventListener('keydown', e => {
    console.log(e);
    if (!(e.ctrlKey && e.shiftKey) || !urlUpdater || e.key !== 'ArrowUp') return;
    window.location.href = urlUpdater(url);
  });
})();
