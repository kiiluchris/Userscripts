// ==UserScript==
// @name         Switch BoxNovel and VipNovel
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @include      /(box|vip)novel\.com\/(vip)?novel\/.*/
// @grant        none
// ==/UserScript==
!function(){const e=e=>n=>n.includes(e)?e:null,n=e("boxnovel"),o=e("vipnovel"),r=window.location.href,t=((e,...n)=>{if(!n.length)throw"No url matching functions provided to findUrlDomain(url, ...fns)";for(const o of n){const n=o(e);return n&&n}return null})(r,n,o);if(!t)return;const l={boxnovel:e=>e.replace("-webnovel","").replace(/(?:box)?novel/g,"vipnovel"),vipnovel:e=>e.replace("vipnovel","boxnovel").replace("vipnovel","novel")}[t],i=(e=>{const n=[];return{add:(e,o)=>{n.push({re:e,formatter:o})},format:o=>{const r=n.find(e=>"string"==typeof e.re?o.includes(e.re):e.re.test(o));return r&&r.formatter[e](o)||o}}})(t);i.add("experimental-log",{boxnovel:e=>e.replace("the-experimental","experimental"),vipnovel:e=>e.replace("experimental","the-experimental")}),window.addEventListener("keydown",e=>{e.ctrlKey&&e.shiftKey&&"ArrowUp"===e.key&&(window.location.href=i.format(l(r)))})}();
