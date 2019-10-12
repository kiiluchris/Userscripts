// ==UserScript==
// @name         KimCartoon
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @include      /kimcartoon\.to\/Cartoon\/[^\/]+\/.*\?id=\d+/
// @grant        none
// ==/UserScript==

(function () {

  const adbContainer = document.getElementById("adbWarnContainer");
  adbContainer && adbContainer.remove();

  const serverChoices = ["RapidVideo", "FE"];
  const serverChoicesSortOrder = Object.entries(serverChoices)
    .reduce((acc, [k, s]) => {
      acc[s] = +k;
      return acc
    }, {});
  const elementSortValue = el =>
    serverChoicesSortOrder[el.innerText.trim()];

  const select = document.getElementById("selectServer");
  if (select && serverChoices.includes(select.selectedOptions[0].innerText.trim())) return
  const feServerUrl = [...select.options]
    .filter(el => serverChoices.includes(el.innerText.trim()))
    .sort((a, b) => elementSortValue(a) - elementSortValue(b))[0].value;
  if (window.location.href.slice(window.location.origin.length) === feServerUrl) return;
  window.location.href = feServerUrl;
})();
