module.exports = {
  "name": "Mtl Novel",
  "namespace": "http://tampermonkey.net/",
  "version": "0.1",
  "author": "kiiluchris",
  "description": "",
  "match": [],
  "include": [/www.mtlnovel.com\/([^/]+)\//],
  "grant": ["GM_openInTab"],
  "require": [],
  "run-at": "document-end",
  "noframes": false
};
