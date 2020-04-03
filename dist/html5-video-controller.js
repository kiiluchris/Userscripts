const e=(e=null)=>n=>t=>{if(!n)throw"No condition function given";const o=({data:{extension:r,messageType:a,data:l}})=>{"Comic Manager"===r&&a==e&&n(l)&&t(l,o)};window.addEventListener("message",o)},n=(n=null)=>t=>new Promise((o,r)=>{e(n)(t)((e,n)=>{console.log(e),o(e),window.removeEventListener("message",n)})}),t=(e=null)=>(n,{mWindow:t=window,target:o="*"}={})=>{t.postMessage({extension:"Comic Manager",messageType:e,data:n},o)},o=["playback"].reduce((o,r)=>(o[r]={addListener:e(r),sendMessage:t(r),once:n(r)},o),{});var r;!function(e){e.Play="K",e.Ahead5="L",e.Prev5="J",e.Ahead10=";",e.Prev10="H",e.Slower=",",e.Faster=".",e.Seek0="0",e.Seek1="1",e.Seek2="2",e.Seek3="3",e.Seek4="4",e.Seek5="5",e.Seek6="6",e.Seek7="7",e.Seek8="8",e.Seek9="9"}(r||(r={}));const a=
/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
function(e,n){var t={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&n.indexOf(o)<0&&(t[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var r=0;for(o=Object.getOwnPropertySymbols(e);r<o.length;r++)n.indexOf(o[r])<0&&Object.prototype.propertyIsEnumerable.call(e,o[r])&&(t[o[r]]=e[o[r]])}return t}(r,["Play","Prev10","Prev5","Ahead10","Ahead5","Slower","Faster"]),l=Object.values(r);Object.values(a);
// ==UserScript==
// @name         HTML Video Controller
// @namespace    http://github.com/kiiluchris/Userscripts/
// @version      0.1
// @description  try to take over the world!
// @author       kiiluchris
// @match        http*://**/*
// @grant        none
// @noframes
// ==/UserScript==
!function(){let e=null;o.playback.addListener(e=>!!e.url)((n,t)=>{null!==e&&n.isFirstSync||(e=n.url,console.log("HTMLVideoController: Focused on "+e))}),window.addEventListener("keyup",n=>{const t=n.key.toUpperCase();if(!l.includes(t))return;if(null===e)return;const r=[...document.getElementsByTagName("iframe")].find(n=>n.src===e);if(!r)return;const a={key:n.key,ctrlKey:n.ctrlKey,shiftKey:n.shiftKey,altKey:n.altKey};o.playback.sendMessage({url:e,keyboard:a},{mWindow:r.contentWindow})}),console.log("HTMLVideoController: activated")}();
