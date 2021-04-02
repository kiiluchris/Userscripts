module.exports = {
  grant: ["GM_openInTab"],
  match: ["https://www.webnovel.com/library*"],
  include: [],
  require: [
    "https://unpkg.com/@popperjs/core@2",
    "https://unpkg.com/tippy.js@6",
  ],
  name: "Webnovel Open Site",
  namespace: "http://tampermonkey.net/",
  version: "0.2",
  description: "try to take over the world!",
  author: "You",
};
