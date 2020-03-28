// ==UserScript==
// @name         HTML Video Controls
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        http*://**/*
// @grant        none
// ==/UserScript==

function getVideoElements() {
  'use strict';
  const videoEl = document.querySelectorAll('video');
  return [...videoEl]
    .filter(el => el.dataset.hasOwnPlaybackControls !== "true");
}

const overlayPosition = ratioOffset =>
  (v, o) => (v * ratioOffset) - (o * ratioOffset)
const overlayCentralPosition = overlayPosition(0.5)
const overlayQuarterPosition = overlayPosition(0.25)
const numToPx = n => `${n}px`
const setOverlayPositionSetup = overlay => videoEl => {
  const top = overlayQuarterPosition(videoEl.clientHeight, overlay.dataset.height)
  const left = overlayCentralPosition(videoEl.clientWidth, overlay.dataset.width)
  overlay.style.top = numToPx(top)
  overlay.style.left = numToPx(left)
}
function setOverlayStyles(el, width, height) {
  el.style = `\
      background-color: rgba(0,0,0,0.5);
      color: #fff;
      text-align: center;
      border-radius: 10%;
      position: absolute;
      z-index: 2147483647;
      display: none;
  `
  el.style.width = numToPx(width);
  el.style.height = numToPx(height);
  el.style.lineHeight = el.style.height;
  el.dataset.width = width
  el.dataset.height = height
}

function setOverlayEvents(el, videoEl, overlayEventHandler) {
  document.addEventListener('fullscreenchange', overlayEventHandler)
  window.addEventListener('resize', overlayEventHandler)
  let playbackTimeoutId = null;
  videoEl.addEventListener('ratechange', _e => {
    console.log(`New Video Rate: ${videoEl.playbackRate}`)
    if (videoEl.dataset.hasOwnPlaybackControls === true) return
    el.style.display = ''
    el.innerText = videoEl.playbackRate + ' X'
    if (playbackTimeoutId !== null) clearTimeout(playbackTimeoutId)
    playbackTimeoutId = setTimeout(() => {
      playbackTimeoutId = null
      el.style.display = 'none'
    }, 1000)
  })
}

function setupPlaybackRate(videoEl) {
  const el = document.createElement('div')
  const width = 80
  const height = 50
  const setOverlayPosition = setOverlayPositionSetup(el)

  el.innerText = '1 X'
  setOverlayStyles(el, width, height)
  setOverlayPosition(videoEl)
  videoEl.insertAdjacentElement('afterEnd', el)
  videoEl.playbackRateOverlay = el
  setOverlayEvents(el, videoEl, _e => {
    setOverlayPosition(videoEl)
  })

  return el
}

const youtubeRegex = /www.youtube.com/
const urlsWithOwnPlaybackRate = [
  /www.youtube.com/
]

function youtubeNavigationMonitor() {
  if (!youtubeRegex.test(window.location.href)) return
  const youtubeAppRoot = document.getElementsByTagName('ytd-app');
  if (!youtubeAppRoot.length) return
  youtubeAppRoot[0].addEventListener('yt-navigate-finish', _e => {
    createPip()
  })
}

function blockOwnPlaybackOverlay(videoEls) {
  if (!youtubeRegex.test(window.location.href)) return
  videoEls.forEach(videoEl => {
    videoEl.dataset.hasOwnPlaybackControls = true
  })
}

function videoControlKeyEvent(eventHandler, playbackRateDelta, pipButton, data = { isRunning: false }) {
  return videoEl => e => {
    if (data.isRunning || !e.shiftKey) return
    if (e.key === '~') {
      pipButton.click()
      return
    }
    data.isRunning = true;
    if (videoEl.dataset.hasOwnPlaybackControls === "true") return
    eventHandler(e)
    switch (e.key) {
      case '<':
        videoEl.playbackRate -= playbackRateDelta
        break
      case '>':
        videoEl.playbackRate += playbackRateDelta
        break
    }
    setTimeout(() => {
      data.isRunning = false;
    }, 250)
  }
}

function setPipEvents(playbackRateDelta, pipButton, getVideoEl) {
  const videoKeydownEventHandler = videoControlKeyEvent(e => {
  }, playbackRateDelta, pipButton)
  window.addEventListener('keyup', e => {
    videoKeydownEventHandler(getVideoEl())(e)
  });
  pipButton.addEventListener('click', async e => {
    if (!document.pictureInPictureElement) {
      await getVideoEl().requestPictureInPicture()
    } else {
      await document.exitPictureInPicture()
    }
  });
}


function addClickListener(el, fn) {
  el.addEventListener('click', e => {
    e.stopPropagation();
    fn(e)
  })
}

function playbackRateControls(video, playbackChangeRate) {
  if (video.dataset.controlsAdded === 'true') return
  video.dataset.controlsAdded = 'true'
  const overlay = document.createElement('div')
  const slower = document.createElement('p')
  const faster = document.createElement('p')
  slower.innerHTML = '&#x1F40C;'
  faster.innerHTML = '&#x1F407;'
  slower.style.color = '#fff'
  faster.style.color = '#fff'
  overlay.style = `\
  position: absolute;
  display: inline-flex;
  grid-column-gap: 8px;
  top: 10px;
  left: 10px;
  z-index: 1000;
  `
  overlay.appendChild(slower)
  overlay.appendChild(faster)
  video.parentElement.appendChild(overlay)
  addClickListener(slower, _e => {
    video.playbackRate -= playbackChangeRate
  })
  addClickListener(faster, _e => {
    video.playbackRate += playbackChangeRate
  })
  return overlay
}

function createPip() {
  'use strict';
  const videoEls = getVideoElements();
  if (!videoEls.length) return [];
  let videoEl = videoEls[0];
  const pipButton = document.createElement('button');
  pipButton.style.display = 'none';
  document.body.appendChild(pipButton);


  const playbackRateDelta = 0.25;
  const videoKeydownEventHandler = videoControlKeyEvent(e => {
    e.stopPropagation()
  }, playbackRateDelta, pipButton, { isRunning: false })
  videoEls.forEach(el => {
    const hasOwnOverlay = urlsWithOwnPlaybackRate
      .some(re => re.test(window.location.href))
    !hasOwnOverlay && setupPlaybackRate(el)
    el.dataset.isPipMonitored = true
    playbackRateControls(el, playbackRateDelta);
    el.addEventListener('focus', _e => {
      videoEl = el
    })
    el.addEventListener('keyup', videoKeydownEventHandler(el), true)
    el.addEventListener('keydown', videoKeydownEventHandler(el), true)
  })

  setPipEvents(playbackRateDelta, pipButton, () => videoEl)
  youtubeNavigationMonitor()
  blockOwnPlaybackOverlay(videoEls)


  return videoEls;
};

function createPipAfterTime(seconds) {
  return new Promise(res => {
    setTimeout(() => res(createPip()), seconds * 1000);
  })
}

(async function () {
  'use strict';
  const printPip = (msg, ...args) => {
    console.group(`Pip Userscript: ${window.location.href}`)
    console.log(`Message: ${msg}`)
    console.log(...args)
    console.groupEnd()
  };

  const n = 5;
  for (let i = 0; i <= n; i++) {
    const pipVideos = await createPipAfterTime(1);
    if (pipVideos.length) {
      return printPip("PiP activated", "Related Videos", pipVideos);
    }
  }
  printPip("PiP not activated")
})().catch(console.error);