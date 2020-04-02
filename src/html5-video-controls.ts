interface CustomHTMLVideoElement extends HTMLVideoElement {
  playbackRateOverlay: HTMLElement
}

interface SyncData {
  isRunning: boolean
}

interface VideoData {
  browserAgent: BrowserAgent,
  focusedVideo: () => CustomHTMLVideoElement,
  playbackChangeRate: number,
  pipButton: HTMLButtonElement,
  eventSyncData: SyncData,
}

interface BrowserAgent {
  chrome: boolean,
  firefox: boolean,
}


enum PlaybackControls {
  Play = "K",
  Ahead5 = "L",
  Prev5 = "J",
  Ahead10 = ";",
  Prev10 = "H",
  Slower = ",",
  Faster = ".",
  Seek0 = "0",
  Seek1 = "1",
  Seek2 = "2",
  Seek3 = "3",
  Seek4 = "4",
  Seek5 = "5",
  Seek6 = "6",
  Seek7 = "7",
  Seek8 = "8",
  Seek9 = "9",
}
const { Play, Prev10, Prev5, Ahead10, Ahead5, Slower, Faster, ...PlaybackSeekControls } = PlaybackControls
type excludedPlaybackControls =
  | typeof PlaybackControls.Play
  | typeof PlaybackControls.Prev5
  | typeof PlaybackControls.Prev10
  | typeof PlaybackControls.Ahead5
  | typeof PlaybackControls.Ahead10
  | typeof PlaybackControls.Slower
  | typeof PlaybackControls.Faster
type PlaybackSeekControls = Exclude<PlaybackControls, excludedPlaybackControls>
const PlaybackControlValues = Object.values(PlaybackControls)
const PlaybackSeekControlValues = Object.values(PlaybackSeekControls)
export { }


// ==UserScript==
// @name         HTML Video Controls
// @namespace    http://github.com/kiiluchris/Userscripts/
// @version      0.2
// @description  try to take over the world!
// @author       kiiluchris
// @match        http*://**/*
// @grant        none
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

function setOverlayEvents(el: HTMLElement, videoEl: CustomHTMLVideoElement, overlayEventHandler: (event: Event) => void) {
  document.addEventListener('fullscreenchange', overlayEventHandler)
  window.addEventListener('resize', overlayEventHandler)
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
  if (video.dataset.controlsAdded === 'true') { return }
  video.dataset.controlsAdded = 'true'
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


function progressRatio(seekBar: HTMLElement, video: CustomHTMLVideoElement) {
  return (e: MouseEvent) => {
    const mouseClickPos = e.pageX - video.offsetLeft
    return mouseClickPos / seekBar.offsetWidth
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
  const seekBar = document.createElement('progress')
  const tooltip = document.createElement('div')
  container.appendChild(seekBar)
  container.appendChild(tooltip)

  const seekBarHeight = 5
  const tooltipHeight = 30

  seekBar.style.width = '100%'
  seekBar.style.height = seekBarHeight + 'px'

  seekBar.value = 0
  seekBar.max = video.duration

  tooltip.style.position = 'relative'
  tooltip.style.top = '5px'
  tooltip.style.left = '0'
  tooltip.style.height = tooltipHeight + 'px'
  tooltip.style.width = '30px'
  tooltip.style.backgroundColor = '#888'
  tooltip.style.color = '#fff'
  tooltip.style.visibility = 'hidden'

  tooltip.innerText = secondsAsTime(video.currentTime)

  video.insertAdjacentElement('afterend', container);

  return {
    tooltip,
    seekBar,
    container
  }
}

const setupHooks = [
  addSetupHook('playbackRateChange', (video, _videoData) => {
    const hasOwnOverlay = urlsWithOwnPlaybackRate
      .some(re => re.test(window.location.href))
    !hasOwnOverlay && setupPlaybackRate(video)
  }),
  addSetupHook('playbackRateChangeUi', (video, videoData) => {
    playbackRateControls(video, videoData.playbackChangeRate);
  }),
  addSetupHook('videoKeyboardEvents', (video, videoData) => {
    video.addEventListener('focus', _e => {
      videoData.focusedVideo = () => video
    })
  }),
  addSetupHook('windowPlayControls', (_video, videoData) => {
    window.addEventListener('keyup', e => {
      const key = e.key.toUpperCase() as PlaybackControls
      if (!PlaybackControlValues.includes(key)) { return }
      const focusedVideo = videoData.focusedVideo()
      if (focusedVideo.readyState !== 4) { return }
      switch (key) {
        case PlaybackControls.Play:
          playbackPlayPause(focusedVideo)
          break
        case PlaybackControls.Prev5:
          playbackReverseByN(focusedVideo, 5)
          break
        case PlaybackControls.Prev10:
          playbackReverseByN(focusedVideo, 10)
          break
        case PlaybackControls.Ahead5:
          playbackForwardByN(focusedVideo, 5)
          break
        case PlaybackControls.Ahead10:
          playbackForwardByN(focusedVideo, 10)
          break
        case PlaybackControls.Slower:
          playbackRateDecrease(focusedVideo, 0.25)
          break;
        case PlaybackControls.Faster:
          playbackRateIncrease(focusedVideo, 0.25)
          break;
        default:
          if (key in PlaybackSeekControls) {
            playbackSeekByPercentage(focusedVideo, key)
          }
          break;
      }
    })
  }),
  addSetupHook("videoSeekTooltip", (video, videoData) => {
    video.addEventListener('loadeddata', _ => {
      if (video.style.position === 'absolute') {
        video.style.removeProperty('position')
      }
      const { tooltip, seekBar, container } = createSeekUi(video)
      const ratioFn = progressRatio(seekBar, video)
      let isSeeking = false
      video.addEventListener('timeupdate', _ => {
        if (isSeeking) return
        seekBar.value = video.currentTime
      })
      seekBar.addEventListener('mouseenter', _ => {
        tooltip.style.visibility = 'visible'
      })
      seekBar.addEventListener('mousemove', e => {
        isSeeking = true
        const seekBarProgress = ratioFn(e)
        tooltip.innerText = secondsAsTime(video.duration * seekBarProgress)
        tooltip.style.left = `${e.pageX}px`
        seekBar.value = seekBar.max * seekBarProgress
      })
      seekBar.addEventListener('mouseup', e => {
        const seekBarProgress = ratioFn(e)
        seekBar.value = seekBar.max * seekBarProgress
        video.currentTime = video.duration * seekBarProgress
      })
      seekBar.addEventListener('mouseleave', e => {
        tooltip.style.visibility = 'hidden'
        isSeeking = false
      })
    })
  })
]

function createPip() {
  'use strict';
  const videoEls = getVideoElements();
  if (!videoEls.length) { return []; }
  const videoData: VideoData = {
    playbackChangeRate: 0.25,
    pipButton: createPipButton(),
    browserAgent: browserAgent(),
    focusedVideo: () => videoEls[0],
    eventSyncData: { isRunning: false },

  }

  videoEls.forEach(el => {
    setupHooks.forEach(hook => hook(el, videoData))
  })

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

(async function () {
  'use strict';
  const printPip = (msg: string, ...args: any[]) => {
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
