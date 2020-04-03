const EXTENSION_NAME = 'Comic Manager';

const setWindowMessageListenerOfType = (messageType = null) => condition => fn => {
  if (!condition) throw "No condition function given";
  const listener = ({ data: { extension, messageType: m, data } }) => {
    if (extension === EXTENSION_NAME && m == messageType && condition(data)) {
      fn(data, listener);
    }
  };
  window.addEventListener("message", listener);
};


const getWindowMessageOfType = (messageType = null) => condition => new Promise((res, rej) => {
  setWindowMessageListenerOfType(messageType)(condition)((data, listener) => {
    console.log(data);
    res(data);
    window.removeEventListener("message", listener);
  });
});

const getWindowMessage = getWindowMessageOfType();

const sendWindowMessageWithType = (messageType = null) => (data, { mWindow = window, target = "*" } = {}) => {
  mWindow.postMessage({
    extension: EXTENSION_NAME,
    messageType,
    data,
  }, target);
};

const sendWindowMessage = sendWindowMessageWithType(null);

const windowMessaging = ["playback"].reduce((acc, key) => {
  acc[key] = {
    addListener: setWindowMessageListenerOfType(key),
    sendMessage: sendWindowMessageWithType(key),
    once: getWindowMessageOfType(key)
  };
  return acc
}, {});

// ==UserScript==
// @name         QT Cannon Fodder's Record of Attacks Open From Comments
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @include      /disqus.com\/embed\/comments\/\?base=default&f=butterflyscurse.stream/
// @grant        none
// ==/UserScript==

(function () {

  const parentUrl = new URL(document.URL).searchParams.get("t_u");
  if (!(
    parentUrl &&
    /butterflyscurse.stream\/[^\/]+-chapter-\d+(?:-\d+)?\/?$/.test(parentUrl)
  )) return console.log(`QT Userscript: Matched frame but invalid parentPage "${parentUrl}"`)
  window.addEventListener('load', async e => {
    const threadData = document.getElementById('disqus-threadData');
    const data = JSON.parse(threadData.innerText);
    const posts = data.response.posts;
    const post = posts.find(post => post.author.isPrimary && post.isApproved);
    if (!post) {
      console.error("Available posts: ", posts);
      throw new Error("Moderator post not found");
    }
    const parser = new DOMParser();
    const doc = parser.parseFromString(post.raw_message, 'text/html');
    const links = [...doc.getElementsByTagName('a')];
    const urls = links.map(el => decodeURIComponent(el.href));
    const validUrls = urls.filter(url => /^https?:\/\/butterflyscurse\.stream\/novel-translations\/qtf-table-of-contents\/qtf/.test(url));
    if (!validUrls.length) return;
    await getWindowMessage(data => data.hasLoaded);
    sendWindowMessage({ urls: validUrls }, {
      mWindow: window.parent,
    });
  });
})();
