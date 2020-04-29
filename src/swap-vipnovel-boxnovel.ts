'use strict';

// ==UserScript==
// @name         Switch BoxNovel and VipNovel
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @include      /(box|vip)novel\.com\/(vip)?novel\/.*/
// @grant        none
// ==/UserScript==

const boxNovelDomain = 'boxnovel'
const vipNovelDomain = 'vipnovel'

type Domains =
  | typeof boxNovelDomain
  | typeof vipNovelDomain

type UrlFormatter = (url: string) => string

interface UrlUpdater {
  [boxNovelDomain]: UrlFormatter,
  [vipNovelDomain]: UrlFormatter,
}

const formatterForDomain = (domain: Domains) => {
  const formatters = [] as ({ re: RegExp | string, formatter: UrlUpdater })[]
  return {
    add: (re: RegExp | string, formatter: UrlUpdater) => {
      formatters.push({ re, formatter })
    },
    format: (url: string) => {
      const f = formatters.find(f => {
        if (typeof f.re === 'string') {
          return url.includes(f.re)
        }
        return f.re.test(url)
      })
      return f && f.formatter[domain](url) || url
    }
  }
}

const findUrlDomain = (url: string, ...fns: ((url: string) => Domains | null)[]): Domains | null => {
  if (!fns.length) throw "No url matching functions provided to findUrlDomain(url, ...fns)"
  for (const fn of fns) {
    const domain = fn(url)
    return domain && (domain as Domains)
  }
  return null
}

(function () {
  'use strict';
  const isUrlOfDomain = (domain: Domains) => (url: string): Domains | null => url.includes(domain) ? domain : null
  const isUrlOfBoxNovel = isUrlOfDomain(boxNovelDomain)
  const isUrlOfVipNovel = isUrlOfDomain(vipNovelDomain)

  const url = window.location.href
  const domain = findUrlDomain(url, isUrlOfBoxNovel, isUrlOfVipNovel)
  if (!domain) return
  const urlUpdaters: UrlUpdater = {
    boxnovel: (url: string) => url.replace('-webnovel', '').replace(/(?:box)?novel/g, 'vipnovel'),
    vipnovel: (url: string) => url.replace('vipnovel', 'boxnovel').replace('vipnovel', 'novel'),
  }

  const urlUpdater = urlUpdaters[domain]
  const urlFormatter = formatterForDomain(domain)
  urlFormatter.add("experimental-log", {
    boxnovel: url => url.replace("the-experimental", "experimental"),
    vipnovel: url => url.replace("experimental", "the-experimental"),
  })
  window.addEventListener('keydown', e => {
    if (!(e.ctrlKey && e.shiftKey) || e.key !== 'ArrowUp') return;
    window.location.href = urlFormatter.format(urlUpdater(url))
  })
})();