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

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

var PlaybackControls;
(function (PlaybackControls) {
    PlaybackControls["Play"] = "K";
    PlaybackControls["Ahead5"] = "L";
    PlaybackControls["Prev5"] = "J";
    PlaybackControls["Ahead10"] = ";";
    PlaybackControls["Prev10"] = "H";
    PlaybackControls["Seek0"] = "0";
    PlaybackControls["Seek1"] = "1";
    PlaybackControls["Seek2"] = "2";
    PlaybackControls["Seek3"] = "3";
    PlaybackControls["Seek4"] = "4";
    PlaybackControls["Seek5"] = "5";
    PlaybackControls["Seek6"] = "6";
    PlaybackControls["Seek7"] = "7";
    PlaybackControls["Seek8"] = "8";
    PlaybackControls["Seek9"] = "9";
})(PlaybackControls || (PlaybackControls = {}));
const PlaybackSeekControls = __rest(PlaybackControls, ["Play", "Prev10", "Prev5", "Ahead10", "Ahead5"]);
const PlaybackControlValues = Object.values(PlaybackControls);
const PlaybackSeekControlValues = Object.values(PlaybackSeekControls);
// ==UserScript==
// @name         HTML Video Controls
// @namespace    http://github.com/kiiluchris/Userscripts/
// @version      0.2
// @description  try to take over the world!
// @author       kiiluchris
// @match        http*://**/*
// @grant        none
// ==/UserScript==
function browserAgent() {
    const userAgent = navigator.userAgent.toLowerCase();
    const res = {
        chrome: false,
        firefox: false,
    };
    if (userAgent.includes('firefox')) {
        res.firefox = true;
    }
    else {
        res.chrome = true;
    }
    return res;
}
function getVideoElements() {
    const videoEl = document.querySelectorAll('video');
    return [...videoEl]
        .filter(el => el.dataset.hasOwnPlaybackControls !== "true");
}
const overlayPosition = (ratioOffset) => (v, o) => (v * ratioOffset) - (o * ratioOffset);
const overlayCentralPosition = overlayPosition(0.5);
const overlayQuarterPosition = overlayPosition(0.25);
const numToPx = (n) => `${n}px`;
const setOverlayPositionSetup = (overlay) => (videoEl) => {
    const top = overlayQuarterPosition(videoEl.clientHeight, +overlay.dataset.height);
    const left = overlayCentralPosition(videoEl.clientWidth, +overlay.dataset.width);
    overlay.style.top = numToPx(top);
    overlay.style.left = numToPx(left);
};
function setOverlayStyles(el, width, height) {
    el.style.backgroundColor = 'rgba(0,0,0,0.5)';
    el.style.color = '#fff';
    el.style.textAlign = 'center';
    el.style.borderRadius = '10%';
    el.style.position = 'absolute';
    el.style.zIndex = '2147483647';
    el.style.display = 'none';
    el.style.width = numToPx(width);
    el.style.height = numToPx(height);
    el.style.lineHeight = el.style.height;
    el.dataset.width = width + '';
    el.dataset.height = height + '';
}
function setOverlayEvents(el, videoEl, overlayEventHandler) {
    document.addEventListener('fullscreenchange', overlayEventHandler);
    window.addEventListener('resize', overlayEventHandler);
    let playbackTimeoutId = null;
    videoEl.addEventListener('ratechange', _e => {
        console.log(`New Video Rate: ${videoEl.playbackRate}`);
        if (videoEl.dataset.hasOwnPlaybackControls === 'true') {
            return;
        }
        el.style.display = '';
        el.innerText = videoEl.playbackRate + ' X';
        if (playbackTimeoutId !== null) {
            clearTimeout(playbackTimeoutId);
        }
        playbackTimeoutId = setTimeout(() => {
            playbackTimeoutId = null;
            el.style.display = 'none';
        }, 1000);
    });
}
function setupPlaybackRate(videoEl) {
    const el = document.createElement('div');
    const width = 80;
    const height = 50;
    const setOverlayPosition = setOverlayPositionSetup(el);
    el.innerText = '1 X';
    setOverlayStyles(el, width, height);
    setOverlayPosition(videoEl);
    videoEl.insertAdjacentElement('afterend', el);
    videoEl.playbackRateOverlay = el;
    setOverlayEvents(el, videoEl, _e => {
        setOverlayPosition(videoEl);
    });
    return el;
}
const youtubeRegex = /www.youtube.com/;
const urlsWithOwnPlaybackRate = [
    /www.youtube.com/
];
function youtubeNavigationMonitor() {
    if (!youtubeRegex.test(window.location.href))
        return;
    const youtubeAppRoot = document.getElementsByTagName('ytd-app');
    if (!youtubeAppRoot.length) {
        return;
    }
    youtubeAppRoot[0].addEventListener('yt-navigate-finish', _e => {
        createPip();
    });
}
function blockOwnPlaybackOverlay(videoEls) {
    if (!youtubeRegex.test(window.location.href))
        return;
    videoEls.forEach(videoEl => {
        videoEl.dataset.hasOwnPlaybackControls = 'true';
    });
}
function videoControlKeyEvent(eventHandler, videoData) {
    return (videoEl) => (e) => {
        if (videoData.eventSyncData.isRunning || !e.shiftKey) {
            return;
        }
        if (e.key === '~') {
            videoData.pipButton.click();
            return;
        }
        videoData.eventSyncData.isRunning = true;
        if (videoEl.dataset.hasOwnPlaybackControls === "true") {
            return;
        }
        eventHandler(e);
        switch (e.key) {
            case '<':
                videoEl.playbackRate -= videoData.playbackChangeRate;
                break;
            case '>':
                videoEl.playbackRate += videoData.playbackChangeRate;
                break;
        }
        setTimeout(() => {
            videoData.eventSyncData.isRunning = false;
        }, 250);
    };
}
function setPipEvents(videoData) {
    window.addEventListener('keyup', e => {
        videoData.blockingKeyboardHandler(videoData.focusedVideo())(e);
    });
    videoData.pipButton.addEventListener('click', (_e) => __awaiter(this, void 0, void 0, function* () {
        if (!('pictureInPictureElement' in document)) {
            yield videoData.focusedVideo().requestPictureInPicture();
        }
        else {
            yield document.exitPictureInPicture();
        }
    }));
}
function addClickListener(el, fn) {
    el.addEventListener('click', e => {
        e.stopPropagation();
        fn(e);
    });
}
function playbackRateControls(video, playbackChangeRate) {
    if (video.dataset.controlsAdded === 'true') {
        return;
    }
    video.dataset.controlsAdded = 'true';
    const overlay = document.createElement('div');
    const slower = document.createElement('p');
    const faster = document.createElement('p');
    slower.innerHTML = '&#x1F40C;';
    faster.innerHTML = '&#x1F407;';
    slower.style.color = '#fff';
    faster.style.color = '#fff';
    overlay.style.position = 'absolute';
    overlay.style.display = 'inline-flex';
    overlay.style.gridColumnGap = '8px';
    overlay.style.top = '10px';
    overlay.style.left = '10px';
    overlay.style.zIndex = '1000000';
    overlay.appendChild(slower);
    overlay.appendChild(faster);
    video.parentElement.appendChild(overlay);
    addClickListener(slower, _e => {
        video.playbackRate -= playbackChangeRate;
    });
    addClickListener(faster, _e => {
        video.playbackRate += playbackChangeRate;
    });
    return overlay;
}
function addSetupHook(propName, fn) {
    return (video, data) => {
        if (video.dataset[propName] === 'true') {
            return;
        }
        video.dataset[propName] = 'true';
        fn(video, data);
    };
}
function createPipButton() {
    const pipButton = document.createElement('button');
    pipButton.style.display = 'none';
    document.body.appendChild(pipButton);
    return pipButton;
}
function playbackPlayPause(video) {
    if (video.ended) {
        video.currentTime = 0;
        video.play();
    }
    else if (video.paused) {
        video.play();
    }
    else {
        video.pause();
    }
}
function playbackReverseByN(video, seconds) {
    if (video.currentTime < seconds) {
        video.currentTime = 0;
    }
    else {
        video.currentTime -= seconds;
    }
}
function playbackForwardByN(video, seconds) {
    if ((video.duration - video.currentTime) < seconds) {
        video.currentTime = video.duration;
    }
    else {
        video.currentTime += seconds;
    }
}
function playbackSeekByPercentage(video, control) {
    const pct = ({
        [PlaybackControls.Seek0]: 0,
        [PlaybackControls.Seek1]: 0.1,
        [PlaybackControls.Seek2]: 0.2,
        [PlaybackControls.Seek3]: 0.3,
        [PlaybackControls.Seek4]: 0.4,
        [PlaybackControls.Seek5]: 0.5,
        [PlaybackControls.Seek6]: 0.6,
        [PlaybackControls.Seek7]: 0.7,
        [PlaybackControls.Seek8]: 0.8,
        [PlaybackControls.Seek9]: 0.9,
    })[control];
    if (pct === undefined) {
        return;
    }
    video.currentTime = video.duration * pct;
}
const setupHooks = [
    addSetupHook('playbackRateChange', (video, _videoData) => {
        const hasOwnOverlay = urlsWithOwnPlaybackRate
            .some(re => re.test(window.location.href));
        !hasOwnOverlay && setupPlaybackRate(video);
    }),
    addSetupHook('playbackRateChangeUi', (video, videoData) => {
        playbackRateControls(video, videoData.playbackChangeRate);
    }),
    addSetupHook('videoKeyboardEvents', (video, videoData) => {
        video.addEventListener('focus', _e => {
            videoData.focusedVideo = () => video;
        });
        video.addEventListener('keyup', videoData.blockingKeyboardHandler(video), true);
        video.addEventListener('keydown', videoData.blockingKeyboardHandler(video), true);
    }),
    addSetupHook('windowPlayControls', (_video, videoData) => {
        window.addEventListener('keyup', e => {
            const key = e.key.toUpperCase();
            if (!PlaybackControlValues.includes(key)) {
                return;
            }
            const focusedVideo = videoData.focusedVideo();
            if (focusedVideo.readyState !== 4) {
                return;
            }
            switch (key) {
                case PlaybackControls.Play:
                    playbackPlayPause(focusedVideo);
                    break;
                case PlaybackControls.Prev5:
                    playbackReverseByN(focusedVideo, 5);
                    break;
                case PlaybackControls.Prev10:
                    playbackReverseByN(focusedVideo, 10);
                    break;
                case PlaybackControls.Ahead5:
                    playbackForwardByN(focusedVideo, 5);
                    break;
                case PlaybackControls.Ahead10:
                    playbackForwardByN(focusedVideo, 10);
                    break;
                default:
                    if (key in PlaybackSeekControls) {
                        playbackSeekByPercentage(focusedVideo, key);
                    }
                    break;
            }
        });
    })
];
function createPip() {
    const videoEls = getVideoElements();
    if (!videoEls.length) {
        return [];
    }
    const videoData = {
        playbackChangeRate: 0.25,
        pipButton: createPipButton(),
        browserAgent: browserAgent(),
        focusedVideo: () => videoEls[0],
        eventSyncData: { isRunning: false },
        get blockingKeyboardHandler() {
            return videoControlKeyEvent(e => {
                e.stopImmediatePropagation();
            }, this);
        }
    };
    videoEls.forEach(el => {
        setupHooks.forEach(hook => hook(el, videoData));
    });
    setPipEvents(videoData);
    youtubeNavigationMonitor();
    blockOwnPlaybackOverlay(videoEls);
    return videoEls;
}
function createPipAfterTime(seconds) {
    return new Promise(res => {
        setTimeout(() => res(createPip()), seconds * 1000);
    });
}
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        const printPip = (msg, ...args) => {
            console.group(`Pip Userscript: ${window.location.href}`);
            console.log(`Message: ${msg}`);
            console.log(...args);
            console.groupEnd();
        };
        const n = 5;
        for (let i = 0; i <= n; i++) {
            const pipVideos = yield createPipAfterTime(1);
            if (pipVideos.length) {
                return printPip("PiP activated", "Related Videos", pipVideos);
            }
        }
        printPip("PiP not activated");
    });
})().catch(console.error);
