// import { eventTrigger } from './shared/extension-sync'

// // ==UserScript==
// // @name         Flying Lines
// // @namespace    http://tampermonkey.net/
// // @version      0.1
// // @description  try to take over the world!
// // @author       You
// // @match        https://www.flying-lines.com/chapter/**/*
// // @match        https://www.flying-lines.com/nu/**/*
// // @grant        none
// // ==/UserScript==



const clickElementAndLog = (selector, message, errorMessage) => {
  const eventTrigger = eventTrigger('novel-multiverse-loaded')
  return _e => {
    eventTrigger(document.body, {})
    const observer = new MutationObserver(_muts => {
      const element = document.querySelector(selector)
      if (!element) return console.log(errorMessage)
      observer.disconnect()
      console.log(message)
      element.click()

    })
    observer.observe(document.body, { childList: true })
  }
}

const deleteElementAndLog = (selector, message, errorMessage) => {
  const flyingLinesLoadEventTrigger = eventTrigger('novelmultiverseloaded')
  return _e => {
    flyingLinesLoadEventTrigger(document.body, {})
    const observer = new MutationObserver(_muts => {
      const element = document.querySelector(selector)
      if (!element) return console.log(errorMessage)
      observer.disconnect()
      console.log(message)
      element.remove()

    })
    observer.observe(document.body, { childList: true })
  }
}

const multiFunc = (...fns) => {
  return (...args) => {
    fns.forEach(fn => fn(...args))
  }
}


(function () {
  'use strict';

  const hideNotificationPrompt = deleteElementAndLog(
    '.g1-popup.g1-popup-newsletter',
    'Sign-up prompt hidden',
    'Sign-up prompt element not found'
  )
  const hideVIPPrompt = clickElementAndLog(
    '#layui-layer1 .icon-sprites3x',
    'VIP prompt hidden',
    'VIP prompt element not found'
  )

  const closeLoginForm = clickElementAndLog(
    'div.modal-login.in i.closes',
    'Login form closed',
    'Login form element not found'
  )

  const match = [
    [/www.flying-lines.com\/nu/, closeLoginForm],
    [/www.flying-lines.com\/chapter/, multiFunc(hideNotificationPrompt, hideVIPPrompt)],
  ].find(([re]) => re.test(window.location.href))
  if (!match) return
  window.addEventListener('load', multiFunc(hideNotificationPrompt, hideVIPPrompt))
})();