// ==UserScript==
// @name         Media Session: Watch Cartoon Online
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @include      /www\.thewatchcartoononline\.tv\/[^\/]+?-(season|episode)/
// @grant        none
// ==/UserScript==

(function () {

  const iframe = document.getElementById("cizgi-js-0");
  if (!iframe) return console.error("Media Session: Iframe not found");

  iframe.scrollIntoView();
  iframe.focus();

  const navigator = window.navigator;
  const frameNavigator = iframe.contentWindow.navigator;
  if (!("mediaSession" in frameNavigator))
    return console.error("Media Session: Not found in navigator");
  const container = document.querySelector(
    "body > div:nth-child(3) > div.twelve.columns > div > div.fourteen.columns"
  );
  const mediaMetadata = new window.MediaMetadata({
    title,
    album,
    artist: "",
    artwork: []
  });
  const title = container.querySelector(".video-title h1").innerText;
  const album = container.querySelector(".header-tag a").innerText;
  const [prev, next] = document.querySelectorAll(
    "div.prev-fln span.prev-next a"
  );
  navigator.mediaSession.metadata = mediaMetadata;
  frameNavigator.mediaSession.metadata = mediaMetadata;

  iframe.addEventListener("load", () => {
    const videoEl = iframe.contentDocument.getElementById("video-js_html5_api");
    prev &&
      frameNavigator.mediaSession.setActionHandler("previoustrack", () => {
        prev.click();
      });
    next &&
      frameNavigator.mediaSession.setActionHandler("nexttrack", () => {
        next.click();
      });
    frameNavigator.mediaSession.setActionHandler("play", () => {
      videoEl.play();
      frameNavigator.mediaSession.playbackState = "playing";
    });
    frameNavigator.mediaSession.setActionHandler("pause", () => {
      videoEl.pause();
      frameNavigator.mediaSession.playbackState = "paused";
    });
    console.log("Media Session: Details set");
  });
})();
