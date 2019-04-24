// ==UserScript==
// @name         Webnovel Open Boxnovel
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.webnovel.com/library
// @grant        GM_openInTab
// ==/UserScript==

(function() {

    const getTitle = title => {
        return ({
            'Experimental Log of the Crazy Lich': 'the-experimental-log-of-the-crazy-lich',
            "It's Not Easy to Be a Man After Travelling to the Future": "crossing-to-the-future-its-not-easy-to-be-a-man",
        })[title] || title
    };

    document.querySelectorAll('.m-book a').forEach(el => {
        el.addEventListener('click', e => {
            if(!(e.ctrlKey && e.shiftKey)) return;
            e.preventDefault();
            const title = el.getElementsByTagName('h3')[0].innerText;
            const formattedTitle = getTitle(title).toLowerCase().replace(/ /g, "-");
            const url = `https://boxnovel.com/novel/${formattedTitle}/`;
            GM_openInTab(url, {
              active: false,
              insert: true,
              setParent: true
            });
        });
    });
})();
