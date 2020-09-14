module.exports = {
  "grant": [
    "GM_openInTab",
    "unsafeWindow"
  ],
  "match": [
    "http*://**/*"
  ],
  "include": [],
  "name": "Skip Novel Update Page",
  "namespace": "https://bitbucket.org/kiilu_chris/userscripts/raw/HEAD/skipUpdatePage.user.js",
  "version": "0.1.6",
  "description": "Open Novel Chapters Immediately",
  "author": "kiilu_chris",
  "noframes": true,
  "run-at": "document-end"
};