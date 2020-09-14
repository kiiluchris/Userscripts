module.exports = {
  "grant": [
    "unsafeWindow"
  ],
  "match": [
    "http*://**/*"
  ],
  "include": [],
  "require": [
    "https://unpkg.com/@popperjs/core@2",
    "https://unpkg.com/tippy.js@6",
  ],
  "name": "Novel Tooltips",
  "namespace": "http://tampermonkey.net/",
  "version": "0.1.1",
  "description": "try to take over the world!",
  "author": "You",
  "noframes": true
};