module.exports = {
  "name": "Mtl Novel",
  "namespace": "http://tampermonkey.net/",
  "version": "0.1",
  "author": "kiiluchris",
  "description": "",
  "match": ["https://www.novelupdates.com/series/*"],
  "include": [/www.mtlnovel.com\/([^/]+)\//],
  "grant": ["GM_openInTab"],
  "require": [],
  "run-at": "document-end",
  "noframes": false
};
