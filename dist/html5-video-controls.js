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
function e(e,t,n,o){return new(n||(n=Promise))((function(a,i){function r(e){try{l(o.next(e))}catch(e){i(e)}}function s(e){try{l(o.throw(e))}catch(e){i(e)}}function l(e){var t;e.done?a(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(r,s)}l((o=o.apply(e,t||[])).next())}))}var t;!function(e){e.Play="K",e.Ahead5="L",e.Prev5="J",e.Ahead10=";",e.Prev10="H",e.Slower=",",e.Faster=".",e.Seek0="0",e.Seek1="1",e.Seek2="2",e.Seek3="3",e.Seek4="4",e.Seek5="5",e.Seek6="6",e.Seek7="7",e.Seek8="8",e.Seek9="9",e.FullScreen="F"}(t||(t={}));const n=function(e,t){var n={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(n[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var a=0;for(o=Object.getOwnPropertySymbols(e);a<o.length;a++)t.indexOf(o[a])<0&&Object.prototype.propertyIsEnumerable.call(e,o[a])&&(n[o[a]]=e[o[a]])}return n}(t,["Play","Prev10","Prev5","Ahead10","Ahead5","Slower","Faster","FullScreen"]),o=Object.values(t),a=Object.values(n),i=(e=null)=>t=>n=>{if(!t)throw"No condition function given";const o=({data:{extension:a,messageType:i,data:r}})=>{"Comic Manager"===a&&i==e&&t(r)&&n(r,o)};window.addEventListener("message",o)},r=(e=null)=>t=>new Promise((n,o)=>{i(e)(t)((e,t)=>{console.log(e),n(e),window.removeEventListener("message",t)})}),s=(e=null)=>(t,{mWindow:n=window,target:o="*"}={})=>{n.postMessage({extension:"Comic Manager",messageType:e,data:t},o)},l=["playback"].reduce((e,t)=>(e[t]={addListener:i(t),sendMessage:s(t),once:r(t)},e),{});
// ==UserScript==
// @name         HTML Video Controls
// @namespace    http://github.com/kiiluchris/Userscripts/
// @version      0.2
// @description  try to take over the world!
// @author       kiiluchris
// @match        http*://**/*
// @grant        none
// ==/UserScript==
function c(){const e={chrome:!1,firefox:!1};return navigator.userAgent.toLowerCase().includes("firefox")?e.firefox=!0:e.chrome=!0,e}const d=e=>(t,n)=>t*e-n*e,u=d(.5),y=d(.25),f=e=>`${e}px`,p=e=>t=>{const n=y(t.clientHeight,+e.dataset.height),o=u(t.clientWidth,+e.dataset.width);e.style.top=f(n),e.style.left=f(o)};function h(e){const t=document.createElement("div"),n=p(t);return t.innerText="1 X",function(e,t,n){e.style.backgroundColor="rgba(0,0,0,0.5)",e.style.color="#fff",e.style.textAlign="center",e.style.borderRadius="10%",e.style.position="absolute",e.style.zIndex="2147483647",e.style.display="none",e.style.width=f(t),e.style.height=f(n),e.style.lineHeight=e.style.height,e.dataset.width=t+"",e.dataset.height=n+""}(t,80,50),n(e),e.insertAdjacentElement("afterend",t),e.playbackRateOverlayEl=t,function(e,t){let n=null;t.addEventListener("ratechange",o=>{console.log(`New Video Rate: ${t.playbackRate}`),"true"!==t.dataset.hasOwnPlaybackControls&&(e.style.display="",e.innerText=t.playbackRate+" X",null!==n&&clearTimeout(n),n=setTimeout(()=>{n=null,e.style.display="none"},1e3))})}(t,e),t}const m=/www.youtube.com/;function v(e,t){e.addEventListener("click",e=>{e.stopPropagation(),t(e)})}function w(e,t){return(n,o)=>{"true"!==n.dataset[e]&&(n.dataset[e]="true",t(n,o))}}function k(e,t){let n=!1;return e=>{n||(n=!0,t(e))}}function b(){const e=document.createElement("button");return e.style.display="none",document.body.appendChild(e),e}function g(e,t){e.currentTime<t?e.currentTime=0:e.currentTime-=t}function E(e,t){e.duration-e.currentTime<t?e.currentTime=e.duration:e.currentTime+=t}function x(e){const t=e/60,n=Math.floor(t);return`${n}:${Math.floor(60*(t-n))}`}const S=[(P="playbackRateChangeOverlay",L=[/www.youtube.com/],T=(e,t)=>{h(e)},L.some(e=>e.test(window.location.href))?(e,t)=>{}:w(P,T)),w("playbackRateChangeUi",(e,t)=>{!function(e,t){const n=document.createElement("div"),o=document.createElement("p"),a=document.createElement("p");o.innerHTML="&#x1F40C;",a.innerHTML="&#x1F407;",o.style.color="#fff",a.style.color="#fff",n.style.position="absolute",n.style.display="inline-flex",n.style.gridColumnGap="8px",n.style.top="10px",n.style.left="10px",n.style.zIndex="1000000",n.appendChild(o),n.appendChild(a),e.parentElement.appendChild(n),e.slowPlaybackEl=o,e.hastenPlaybackEl=a,v(o,n=>{e.playbackRate-=t}),v(a,n=>{e.playbackRate+=t})}(e,t.playbackChangeRate)}),w("videoKeyboardEvents",(e,t)=>{e.addEventListener("focus",n=>{t.focusedVideo=()=>e,A(!1)})}),w("videoSeekTooltip",(e,t)=>{e.addEventListener("loadeddata",t=>{const{tooltip:n,seekBar:o,container:a}=function(e){const t=document.createElement("div"),n=document.createElement("progress"),o=document.createElement("div");return t.appendChild(n),t.appendChild(o),t.style.position="relative",t.style.top=e.offsetHeight+"px",n.style.width="100%",n.style.height="5px",n.value=0,n.max=e.duration,o.style.position="relative",o.style.top="5px",o.style.left="0",o.style.height="30px",o.style.width="30px",o.style.backgroundColor="#888",o.style.color="#fff",o.style.visibility="hidden",o.innerText=x(e.currentTime),e.insertAdjacentElement("afterend",t),{tooltip:o,seekBar:n,container:t}}(e);e.seekbarEl=o,e.seekbarTooltipEl=n;const i=function(e,t){return n=>(n.pageX-t.offsetLeft)/e.offsetWidth}(o,e);let r=!1;e.addEventListener("timeupdate",t=>{r||(o.value=e.currentTime)}),e.addEventListener("fullscreenchange",e=>{o.style.visibility=document.fullscreenElement?"hidden":"visible"}),o.addEventListener("mouseenter",e=>{n.style.visibility="visible"}),o.addEventListener("mousemove",t=>{r=!0;const a=i(t);n.innerText=x(e.duration*a),n.style.left=`${t.pageX}px`,o.value=o.max*a}),o.addEventListener("mouseup",t=>{const n=i(t);o.value=o.max*n,e.currentTime=e.duration*n}),o.addEventListener("mouseleave",e=>{n.style.visibility="hidden",r=!1})})})];var P,L,T;const C=[k(0,e=>{const t=t=>{const n=e.focusedVideo();p(n.playbackRateOverlayEl)(n)};document.addEventListener("fullscreenchange",t),window.addEventListener("resize",t)}),function(e,t,n){return t.some(e=>e.test(window.location.href))?e=>{}:k(0,n)}(0,[/www.youtube.com/,/vimeo.com/],e=>{window.addEventListener("keyup",n=>{const i=n.key.toUpperCase();if(console.log(i,t),!o.includes(i))return;const r=e.focusedVideo();var s;if(4===r.readyState)switch(i){case t.Play:(s=r).ended?(s.currentTime=0,s.play()):s.paused?s.play():s.pause();break;case t.Prev5:g(r,5);break;case t.Prev10:g(r,10);break;case t.Ahead5:E(r,5);break;case t.Ahead10:E(r,10);break;case t.Slower:!function(e,t){const n=e.playbackRate-t;n<.5||(e.playbackRate=n)}(r,.25);break;case t.Faster:!function(e,t){e.playbackRate+=t}(r,.25);break;case t.FullScreen:document.fullscreenElement?document.exitFullscreen():r.requestFullscreen();break;default:a.includes(i)&&function(e,n){const o={[t.Seek0]:0,[t.Seek1]:.1,[t.Seek2]:.2,[t.Seek3]:.3,[t.Seek4]:.4,[t.Seek5]:.5,[t.Seek6]:.6,[t.Seek7]:.7,[t.Seek8]:.8,[t.Seek9]:.9}[n];void 0!==o&&(e.currentTime=e.duration*o)}(r,i)}})})];function O(){const t=[...document.querySelectorAll("video")].filter(e=>"true"!==e.dataset.hasOwnPlaybackControls);if(!t.length)return[];const n={playbackChangeRate:.25,pipButton:b(),browserAgent:c(),focusedVideo:()=>t[0],eventSyncData:{isRunning:!1}};return t.forEach(e=>{S.forEach(t=>t(e,n))}),C.forEach(e=>e(n)),function(t){window.addEventListener("keyup",e=>{!t.browserAgent.firefox&&e.ctrlKey&&e.shiftKey&&"}"===e.key&&t.pipButton.click()}),t.pipButton.addEventListener("click",n=>e(this,void 0,void 0,(function*(){document.pictureInPictureElement?yield document.exitPictureInPicture():yield t.focusedVideo().requestPictureInPicture()})))}(n),function(){if(!m.test(window.location.href))return;const e=document.getElementsByTagName("ytd-app");e.length&&e[0].addEventListener("yt-navigate-finish",e=>{O()})}(),function(e){m.test(window.location.href)&&e.forEach(e=>{e.dataset.hasOwnPlaybackControls="true"})}(t),t}function R(e){return new Promise(t=>{setTimeout(()=>t(O()),1e3*e)})}function A(e){window.parent!==window&&l.playback.sendMessage({url:window.location.href,isFirstSync:e},{mWindow:window.parent})}(function(){return e(this,void 0,void 0,(function*(){const e=(e,...t)=>{console.group(`Pip Userscript: ${window.location.href}`),console.log(`Message: ${e}`),t.length&&console.log(...t),console.groupEnd()};for(let t=0;t<=5;t++){const t=yield R(1);if(t.length)return window.parent!==window&&(A(!0),l.playback.addListener(({url:e,keyboard:t})=>e===window.location.href&&!!t)((e,t)=>{const n=new KeyboardEvent("keyup",Object.assign({},e.keyboard));window.dispatchEvent(n)})),e("PiP activated","Related Videos",t)}e("PiP inactive","No videos found")}))})().catch(console.error);
