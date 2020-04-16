const e=(e=null)=>n=>o=>{if(!n)throw"No condition function given";const t=({data:{extension:a,messageType:r,data:l}})=>{"Comic Manager"===a&&r==e&&n(l)&&o(l,t)};window.addEventListener("message",t)},n=(n=null)=>o=>new Promise((t,a)=>{e(n)(o)((e,n)=>{console.log(e),t(e),window.removeEventListener("message",n)})}),o=(e=null)=>(n,{mWindow:o=window,target:t="*"}={})=>{o.postMessage({extension:"Comic Manager",messageType:e,data:n},t)},t=["playback","rawPlayback"].reduce((t,a)=>(t[a]={addListener:e(a),sendMessage:o(a),once:n(a)},t),{});var a;!function(e){e.Play="K",e.Ahead5="L",e.Prev5="J",e.Ahead10=";",e.Prev10="H",e.Slower=",",e.Faster=".",e.Seek0="0",e.Seek1="1",e.Seek2="2",e.Seek3="3",e.Seek4="4",e.Seek5="5",e.Seek6="6",e.Seek7="7",e.Seek8="8",e.Seek9="9",e.FullScreen="`"}(a||(a={}));const r=
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
function(e,n){var o={};for(var t in e)Object.prototype.hasOwnProperty.call(e,t)&&n.indexOf(t)<0&&(o[t]=e[t]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var a=0;for(t=Object.getOwnPropertySymbols(e);a<t.length;a++)n.indexOf(t[a])<0&&Object.prototype.propertyIsEnumerable.call(e,t[a])&&(o[t[a]]=e[t[a]])}return o}(a,["Play","Prev10","Prev5","Ahead10","Ahead5","Slower","Faster","FullScreen"]),l=Object.values(a);Object.values(r);
// ==UserScript==
// @name         HTML Video Controller
// @namespace    http://github.com/kiiluchris/Userscripts/
// @version      0.1
// @description  try to take over the world!
// @author       kiiluchris
// @match        http*://**/*
// @grant        unsafeWindow
// @noframes
// ==/UserScript==
!function(){let e=null;t.playback.addListener(e=>!!e.url)((n,o)=>{null!==e&&n.isFirstSync||(e=n.url,console.log("HTMLVideoController: Focused on "+e))});const n=()=>{if(null!==e)return[...document.getElementsByTagName("iframe")].find(n=>n.src===e)};
// @ts-ignore: Undefined type of "unsafeWindow", only available in userscript
unsafeWindow.playbackControls=Object.assign(unsafeWindow.playbackControls||{},{controlIframe:e=>{const o=n();o&&t.rawPlayback.sendMessage(e,{mWindow:o.contentWindow})}}),window.addEventListener("keyup",o=>{const a=o.key.toUpperCase();if(!l.includes(a))return;const r=n();if(!r)return;const s={key:o.key,ctrlKey:o.ctrlKey,shiftKey:o.shiftKey,altKey:o.altKey};t.playback.sendMessage({url:e,keyboard:s},{mWindow:r.contentWindow})}),console.log("HTMLVideoController: activated")}();
