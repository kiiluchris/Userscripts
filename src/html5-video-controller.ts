import {
  KeyboardData, windowMessaging
} from './shared/extension-sync';
import { PlaybackControlValues, PlaybackControls } from './types/playback';


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

(function () {
  let currentFocusedFrameOrigin: string = null
  windowMessaging.playback.addListener(data => !!data.url)(
    (data, _listener) => {
      if (currentFocusedFrameOrigin !== null && data.isFirstSync) return
      currentFocusedFrameOrigin = data.url
      console.log("HTMLVideoController: Focused on " + currentFocusedFrameOrigin)
    }
  )

  const getCurrentFrame = () => {
    if (currentFocusedFrameOrigin === null) return
    return [...document.getElementsByTagName("iframe")]
      .find(f => f.src === currentFocusedFrameOrigin)
  }

  const runPlaybackControls = (keyboard: KeyboardData) => {
    const iframe = getCurrentFrame()
    if (!iframe) return
    windowMessaging.rawPlayback.sendMessage(keyboard, {
      mWindow: iframe.contentWindow
    })
  }

  // @ts-ignore: Undefined type of "unsafeWindow", only available in userscript
  unsafeWindow.videoPlaybackController = runPlaybackControls

  window.addEventListener('keyup', e => {
    const key = e.key.toUpperCase() as PlaybackControls
    if (!PlaybackControlValues.includes(key)) return
    const iframe = getCurrentFrame()
    if (!iframe) return
    const data: KeyboardData = {
      key: e.key,
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
      altKey: e.altKey
    }
    windowMessaging.playback.sendMessage({
      url: currentFocusedFrameOrigin,
      keyboard: data
    }, {
      mWindow: iframe.contentWindow
    })
  })
  console.log("HTMLVideoController: activated")
})()