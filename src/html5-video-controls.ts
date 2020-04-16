import {
  CustomHTMLVideoElement, PlaybackSeekControls,
  PlaybackControlValues, PlaybackSeekControlValues,
  BrowserAgent, VideoData, PlaybackControls
} from './types/playback'

export { }

import {
  sendPlaybackWindowMessage, setWindowMessageListener,
  PlaybackControlsData, windowMessaging, KeyboardData
} from './shared/extension-sync.js'

// ==UserScript==
// @name         HTML Video Controls
// @namespace    http://github.com/kiiluchris/Userscripts/
// @version      0.2
// @description  try to take over the world!
// @author       kiiluchris
// @match        http*://**/*
// @grant        unsafeWindow
// ==/UserScript==

function browserAgent(): BrowserAgent {
  const userAgent = navigator.userAgent.toLowerCase()
  const res = {
    chrome: false,
    firefox: false,
  }
  if (userAgent.includes('firefox')) {
    res.firefox = true
  } else {
    res.chrome = true
  }
  return res
}

function getVideoElements(): CustomHTMLVideoElement[] {
  'use strict';
  const videoEl = <NodeListOf<CustomHTMLVideoElement>>document.querySelectorAll('video');
  return [...videoEl]
    .filter(el => el.dataset.hasOwnPlaybackControls !== "true");
}

const overlayPosition = (ratioOffset: number) =>
  (v: number, o: number) => (v * ratioOffset) - (o * ratioOffset)
const overlayCentralPosition = overlayPosition(0.5)
const overlayQuarterPosition = overlayPosition(0.25)
const numToPx = (n: number) => `${n}px`
const setOverlayPositionSetup = (overlay: HTMLElement) => (videoEl: CustomHTMLVideoElement) => {
  const top = overlayQuarterPosition(videoEl.clientHeight, +overlay.dataset.height)
  const left = overlayCentralPosition(videoEl.clientWidth, +overlay.dataset.width)
  overlay.style.top = numToPx(top)
  overlay.style.left = numToPx(left)
}
function setOverlayStyles(el: HTMLElement, width: number, height: number) {
  el.style.backgroundColor = 'rgba(0,0,0,0.5)'
  el.style.color = '#fff'
  el.style.textAlign = 'center'
  el.style.borderRadius = '10%'
  el.style.position = 'absolute'
  el.style.zIndex = '2147483647'
  el.style.display = 'none'
  el.style.width = numToPx(width);
  el.style.height = numToPx(height);
  el.style.lineHeight = el.style.height;
  el.dataset.width = width + ''
  el.dataset.height = height + ''
}

function setOverlayEvents(el: HTMLElement, videoEl: CustomHTMLVideoElement) {
  let playbackTimeoutId: NodeJS.Timeout = null;
  videoEl.addEventListener('ratechange', _e => {
    console.log(`New Video Rate: ${videoEl.playbackRate}`)
    if (videoEl.dataset.hasOwnPlaybackControls === 'true') { return }
    el.style.display = ''
    el.innerText = videoEl.playbackRate + ' X'
    if (playbackTimeoutId !== null) { clearTimeout(playbackTimeoutId) }
    playbackTimeoutId = setTimeout(() => {
      playbackTimeoutId = null
      el.style.display = 'none'
    }, 1000)
  })
}

function setupPlaybackRate(videoEl: CustomHTMLVideoElement): HTMLDivElement {
  const el = document.createElement('div')
  const width = 80
  const height = 50
  const setOverlayPosition = setOverlayPositionSetup(el)

  el.innerText = '1 X'
  setOverlayStyles(el, width, height)
  setOverlayPosition(videoEl)
  videoEl.insertAdjacentElement('afterend', el)
  videoEl.playbackRateOverlayEl = el
  setOverlayEvents(el, videoEl)

  return el
}

const youtubeRegex = /www.youtube.com/

function youtubeNavigationMonitor() {
  if (!youtubeRegex.test(window.location.href)) return
  const youtubeAppRoot = document.getElementsByTagName('ytd-app');
  if (!youtubeAppRoot.length) { return }
  youtubeAppRoot[0].addEventListener('yt-navigate-finish', _e => {
    createPip()
  })
}

function blockOwnPlaybackOverlay(videoEls: CustomHTMLVideoElement[]) {
  if (!youtubeRegex.test(window.location.href)) return
  videoEls.forEach(videoEl => {
    videoEl.dataset.hasOwnPlaybackControls = 'true'
  })
}


function setPipEvents(videoData: VideoData) {
  window.addEventListener('keyup', e => {
    if (!videoData.browserAgent.firefox && e.ctrlKey && e.shiftKey && e.key === '}') {
      videoData.pipButton.click()
    }
  });
  videoData.pipButton.addEventListener('click', async (_e: MouseEvent) => {
    if (!(<any>document).pictureInPictureElement) {
      await (<any>videoData.focusedVideo()).requestPictureInPicture()
    } else {
      await (<any>document).exitPictureInPicture()
    }
  });
}


function addClickListener(el: HTMLElement, fn: (event: MouseEvent) => void) {
  el.addEventListener('click', e => {
    e.stopPropagation();
    fn(e)
  })
}

function playbackRateControls(video: CustomHTMLVideoElement, playbackChangeRate: number) {
  const overlay = document.createElement('div')
  const slower = document.createElement('p')
  const faster = document.createElement('p')
  slower.innerHTML = '&#x1F40C;'
  faster.innerHTML = '&#x1F407;'
  slower.style.color = '#fff'
  faster.style.color = '#fff'
  overlay.style.position = 'absolute'
  overlay.style.display = 'inline-flex'
  overlay.style.gridColumnGap = '8px'
  overlay.style.top = '10px'
  overlay.style.left = '10px'
  overlay.style.zIndex = '1000000'
  overlay.appendChild(slower)
  overlay.appendChild(faster)
  video.parentElement.appendChild(overlay)
  video.slowPlaybackEl = slower
  video.hastenPlaybackEl = faster

  addClickListener(slower, _e => {
    video.playbackRate -= playbackChangeRate
  })
  addClickListener(faster, _e => {
    video.playbackRate += playbackChangeRate
  })
  return overlay
}

function addSetupHook(propName: string, fn: (video: CustomHTMLVideoElement, data: VideoData) => void) {
  return (video: CustomHTMLVideoElement, videoData: VideoData) => {
    if (video.dataset[propName] === 'true') { return }
    video.dataset[propName] = 'true'
    fn(video, videoData)
  }
}
function addWindowSetupHook(_propName: string, fn: (data: VideoData) => void) {
  let hasRun = false
  return (videoData: VideoData) => {
    if (hasRun) return
    hasRun = true
    fn(videoData)
  }
}

function addSetupHookExceptUrls(propName: string, exprs: RegExp[], fn: (video: CustomHTMLVideoElement, data: VideoData) => void): (video: CustomHTMLVideoElement, videoData: VideoData) => void {
  if (exprs.some(re => re.test(window.location.href))) {
    return (_video, _data) => { }
  }
  return addSetupHook(propName, fn)
}

function addWindowSetupHookExceptUrls(propName: string, exprs: RegExp[], fn: (data: VideoData) => void): (videoData: VideoData) => void {
  if (exprs.some(re => re.test(window.location.href))) {
    return (_data) => { }
  }
  return addWindowSetupHook(propName, fn)
}

function createPipButton(): HTMLButtonElement {
  const pipButton = document.createElement('button');
  pipButton.style.display = 'none';
  document.body.appendChild(pipButton);
  return pipButton
}

function playbackPlayPause(video: CustomHTMLVideoElement) {
  if (video.ended) {
    video.currentTime = 0
    video.play()
  } else if (video.paused) {
    video.play()
  } else {
    video.pause()
  }
}

function playbackReverseByN(video: CustomHTMLVideoElement, seconds: number) {
  if (video.currentTime < seconds) {
    video.currentTime = 0
  } else {
    video.currentTime -= seconds
  }
}


function playbackForwardByN(video: CustomHTMLVideoElement, seconds: number) {
  if ((video.duration - video.currentTime) < seconds) {
    video.currentTime = video.duration
  } else {
    video.currentTime += seconds
  }
}

function playbackSeekByPercentage(video: CustomHTMLVideoElement, control: PlaybackSeekControls) {
  const pct: number = ({
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
  })[control]
  if (pct === undefined) { return }
  video.currentTime = video.duration * pct
}

function playbackRateIncrease(video: CustomHTMLVideoElement, amount: number) {
  video.playbackRate += amount
}

function playbackRateDecrease(video: CustomHTMLVideoElement, amount: number) {
  const nextRate = video.playbackRate - amount
  if (nextRate < 0.5) { return }
  video.playbackRate = nextRate
}


function progressRatio(seekbar: HTMLElement, video: CustomHTMLVideoElement) {
  return (e: MouseEvent) => {
    const mouseClickPos = e.pageX - video.offsetLeft
    return mouseClickPos / seekbar.offsetWidth
  }
}
function secondsAsTime(seconds: number) {
  const minutesWithSecs = seconds / 60
  const minutes = Math.floor(minutesWithSecs)
  const remainingSeconds = Math.floor((minutesWithSecs - minutes) * 60)
  return `${minutes}:${remainingSeconds}`
}

function createSeekUi(video: CustomHTMLVideoElement) {
  const container = document.createElement('div')
  const seekbar = document.createElement('progress')
  const tooltip = document.createElement('div')
  container.appendChild(seekbar)
  container.appendChild(tooltip)

  const seekbarHeight = 5
  const tooltipHeight = 30

  container.style.display = 'none' // Remove to display seekbar
  container.style.position = 'relative'
  container.style.top = video.offsetHeight + 'px'

  seekbar.style.width = '100%'
  seekbar.style.height = seekbarHeight + 'px'

  tooltip.style.position = 'absolute'
  tooltip.style.top = '5px'
  tooltip.style.left = '0'
  tooltip.style.height = tooltipHeight + 'px'
  tooltip.style.width = '30px'
  tooltip.style.backgroundColor = '#888'
  tooltip.style.color = '#fff'
  tooltip.style.visibility = 'hidden'


  video.insertAdjacentElement('afterend', container);

  video.seekbarEl = seekbar
  video.seekbarTooltipEl = tooltip


  return {
    tooltip,
    seekbar,
    seekbarContainer: container
  }
}

function setSeekUiValues(video: CustomHTMLVideoElement) {
  (<HTMLProgressElement>video.seekbarEl).value = 0;
  (<HTMLProgressElement>video.seekbarEl).max = video.duration;
  video.seekbarTooltipEl.innerText = secondsAsTime(video.currentTime);
}

const setupHooks = [
  addSetupHookExceptUrls('playbackRateChangeOverlay', [
    /www.youtube.com/
  ], (video, _videoData) => {
    setupPlaybackRate(video)
  }),
  addSetupHook('playbackRateChangeUi', (video, videoData) => {
    playbackRateControls(video, videoData.playbackChangeRate);
  }),
  addSetupHook('videoKeyboardEvents', (video, videoData) => {
    video.addEventListener('focus', _e => {
      videoData.focusedVideo = () => video
      syncFocusedFrameWithParent(false)
    })
  }),
  addSetupHook("videoSeekTooltip", (video, videoData) => {
    const { tooltip, seekbar, seekbarContainer } = createSeekUi(video)
    let ratioFn: (e: MouseEvent) => number = _ => 0
    video.addEventListener('loadeddata', _ => {
      setSeekUiValues(video)
      ratioFn = progressRatio(seekbar, video)
    })
    let isSeeking = false
    video.addEventListener('timeupdate', _ => {
      if (isSeeking) return
      seekbar.value = video.currentTime
    })
    seekbar.addEventListener('mouseenter', _ => {
      tooltip.style.visibility = 'visible'
    })
    seekbar.addEventListener('mousemove', e => {
      isSeeking = true
      const seekbarProgress = ratioFn(e)
      tooltip.innerText = secondsAsTime(video.duration * seekbarProgress)
      tooltip.style.left = `${e.pageX}px`
      seekbar.value = seekbar.max * seekbarProgress
    })
    seekbar.addEventListener('mouseup', e => {
      const seekbarProgress = ratioFn(e)
      seekbar.value = seekbar.max * seekbarProgress
      video.currentTime = video.duration * seekbarProgress
    })
    seekbar.addEventListener('mouseleave', e => {
      tooltip.style.visibility = 'hidden'
      isSeeking = false
    })
  })
]

const windowScopedSetupEvents = [
  addWindowSetupHook('windowEvents', (videoData) => {
    const overlayEventHandler = (_e: Event) => {
      const videoEl = videoData.focusedVideo()
      setOverlayPositionSetup(videoEl.playbackRateOverlayEl)(videoEl)
      if (!!document.fullscreenElement) {
        videoEl.seekbarEl.parentElement.style.top = "0"
      } else {
        videoEl.seekbarEl.parentElement.style.top = videoEl.offsetHeight + "px"
      }
    }
    document.addEventListener('fullscreenchange', overlayEventHandler)
    window.addEventListener('resize', overlayEventHandler)
  }),
  addWindowSetupHookExceptUrls('windowPlayControls', [
    /www.youtube.com/,
    /vimeo.com/,
  ], (videoData) => {
    window.addEventListener('keyup', e => {
      const focusedVideo = videoData.focusedVideo()
      if (focusedVideo.readyState !== 4) { return }
      e.stopImmediatePropagation()
      runPlaybackControls(focusedVideo, {
        key: e.key,
        altKey: e.altKey,
        shiftKey: e.shiftKey,
        ctrlKey: e.ctrlKey
      })
    })
  }),
  addWindowSetupHook('windowExposedPlaybackControls', videoData => {
    // @ts-ignore: Unsafewindow is global in userscript context
    unsafeWindow.playbackControls = Object.assign(unsafeWindow.playbackControls || {}, {
      controlVideo: (keyboard: KeyboardData) => {
        runPlaybackControls(videoData.focusedVideo(), keyboard)
      }
    })

    windowMessaging.rawPlayback.addListener(_ => true)((keyboard, _listener) => {
      runPlaybackControls(videoData.focusedVideo(), keyboard)
    })
  })
]

function runPlaybackControls(video: CustomHTMLVideoElement, keyboard: KeyboardData) {
  const key = keyboard.key.toUpperCase() as PlaybackControls
  if (!PlaybackControlValues.includes(key)) { return }
  switch (key) {
    case PlaybackControls.Play:
      playbackPlayPause(video)
      break
    case PlaybackControls.Prev5:
      playbackReverseByN(video, 5)
      break
    case PlaybackControls.Prev10:
      playbackReverseByN(video, 10)
      break
    case PlaybackControls.Ahead5:
      playbackForwardByN(video, 5)
      break
    case PlaybackControls.Ahead10:
      playbackForwardByN(video, 10)
      break
    case PlaybackControls.Slower:
      playbackRateDecrease(video, 0.25)
      break;
    case PlaybackControls.Faster:
      playbackRateIncrease(video, 0.25)
      break;
    case PlaybackControls.FullScreen:
      if (!document.fullscreenElement) {
        video.requestFullscreen()
      } else {
        document.exitFullscreen()
      }
      break;
    default:
      if (PlaybackSeekControlValues.includes(key)) {
        playbackSeekByPercentage(video, key)
      }
      break;
  }
}

function createPip() {
  'use strict';
  const videoEls = getVideoElements();
  if (!videoEls.length) { return []; }
  const videoData: VideoData = {
    playbackChangeRate: 0.25,
    pipButton: createPipButton(),
    browserAgent: browserAgent(),
    focusedVideo: () => videoEls[0],
    eventSyncData: {},

  }

  videoEls.forEach(el => {
    setupHooks.forEach(hook => hook(el, videoData))
  })

  windowScopedSetupEvents.forEach(hook => hook(videoData))
  setPipEvents(videoData)
  youtubeNavigationMonitor()
  blockOwnPlaybackOverlay(videoEls)


  return videoEls;
};

function createPipAfterTime(seconds: number): Promise<CustomHTMLVideoElement[]> {
  return new Promise(res => {
    setTimeout(() => res(createPip()), seconds * 1000);
  })
}

function syncFocusedFrameWithParent(isFirstSync: boolean) {
  if (window.parent === window) { return }
  windowMessaging.playback.sendMessage({
    url: window.location.href,
    isFirstSync,
  }, {
    mWindow: window.parent,
  })
}

function setupParentWindowListener() {
  if (window.parent === window) { return }
  syncFocusedFrameWithParent(true)
  windowMessaging.playback.addListener(
    ({ url, keyboard }) => url === window.location.href && !!keyboard
  )((data, _listener) => {
    const evt = new KeyboardEvent("keyup", {
      ...data.keyboard
    })
    window.dispatchEvent(evt)
  })
}


(async function () {
  'use strict';
  const printPip = (msg: string, ...args: any[]) => {
    console.group(`Pip Userscript: ${window.location.href}`)
    console.log(`Message: ${msg}`)
    args.length && console.log(...args)
    console.groupEnd()
  };

  const n = 5;
  for (let i = 0; i <= n; i++) {
    const pipVideos = await createPipAfterTime(1);
    if (pipVideos.length) {
      setupParentWindowListener()
      return printPip("PiP activated", "Related Videos", pipVideos);
    }
  }
  printPip("PiP inactive", "No videos found")
})().catch(console.error);
