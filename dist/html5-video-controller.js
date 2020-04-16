const e=(e=null)=>n=>t=>{if(!n)throw"No condition function given";const o=({data:{extension:a,messageType:r,data:l}})=>{"Comic Manager"===a&&r==e&&n(l)&&t(l,o)};window.addEventListener("message",o)},n=(n=null)=>t=>new Promise((o,a)=>{e(n)(t)((e,n)=>{console.log(e),o(e),window.removeEventListener("message",n)})}),t=(e=null)=>(n,{mWindow:t=window,target:o="*"}={})=>{t.postMessage({extension:"Comic Manager",messageType:e,data:n},o)},o=["playback","rawPlayback"].reduce((o,a)=>(o[a]={addListener:e(a),sendMessage:t(a),once:n(a)},o),{});var a;!function(e){e.Play="K",e.Ahead5="L",e.Prev5="J",e.Ahead10=";",e.Prev10="H",e.Slower=",",e.Faster=".",e.Seek0="0",e.Seek1="1",e.Seek2="2",e.Seek3="3",e.Seek4="4",e.Seek5="5",e.Seek6="6",e.Seek7="7",e.Seek8="8",e.Seek9="9",e.FullScreen="`"}(a||(a={}));const r=
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
function(e,n){var t={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&n.indexOf(o)<0&&(t[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var a=0;for(o=Object.getOwnPropertySymbols(e);a<o.length;a++)n.indexOf(o[a])<0&&Object.prototype.propertyIsEnumerable.call(e,o[a])&&(t[o[a]]=e[o[a]])}return t}(a,["Play","Prev10","Prev5","Ahead10","Ahead5","Slower","Faster","FullScreen"]),l=Object.values(a);Object.values(r);
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
!function(){let e=null;o.playback.addListener(e=>!!e.url)((n,t)=>{null!==e&&n.isFirstSync||(e=n.url,console.log("HTMLVideoController: Focused on "+e))});const n=()=>{if(null!==e)return[...document.getElementsByTagName("iframe")].find(n=>n.src===e)};
// @ts-ignore: Undefined type of "unsafeWindow", only available in userscript
unsafeWindow.videoPlaybackController=e=>{const t=n();t&&o.rawPlayback.sendMessage(e,{mWindow:t.contentWindow})},window.addEventListener("keyup",t=>{const a=t.key.toUpperCase();if(!l.includes(a))return;const r=n();if(!r)return;const s={key:t.key,ctrlKey:t.ctrlKey,shiftKey:t.shiftKey,altKey:t.altKey};o.playback.sendMessage({url:e,keyboard:s},{mWindow:r.contentWindow})}),console.log("HTMLVideoController: activated")}();
