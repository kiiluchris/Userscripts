module.exports = {
  "name": "Abbreviated Chapter Listing",
  "namespace": "http://tampermonkey.net/",
  "version": "0.1",
  "author": "kiiluchris",
  "description": "",
  "match": [
    "https://www.fuyuneko.org/*",
    "https://wordexcerpt.com/series/*/",
  ],
  "include": [],
  "grant": [],
  "require": [
    "https://unpkg.com/@popperjs/core@2",
    "https://unpkg.com/tippy.js@6"
  ],
  "run-at": "document-end",
  "noframes": false
};
