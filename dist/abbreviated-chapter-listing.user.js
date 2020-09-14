// ==UserScript==
// @name           Abbreviated Chapter Listing
// @namespace      http://tampermonkey.net/
// @version        0.1
// @author         kiiluchris
// @description    try to take over the world!
// @match          https://www.fuyuneko.org/*
// @match          https://wordexcerpt.com/series/*/
// @require        https://unpkg.com/@popperjs/core@2
// @require        https://unpkg.com/tippy.js@6
// @run-at         document-end
// ==/UserScript==
const groupBy = (xs, f) => {
    if (xs.length === 0)
        return [];
    const lastIndex = xs.length - 1;
    const ys = [[xs[0]]];
    let groupIndex = 0;
    for (let i = 0; i < lastIndex; i++) {
        const next = xs[i + 1];
        if (f(xs[i], next)) {
            ys[groupIndex].push(next);
        }
        else {
            groupIndex += 1;
            ys.push([next]);
        }
    }
    return ys;
};

const chapterListHTML = (chapterList) => {
    const tip = document.createElement('div');
    tip.style.fontSize = '12px';
    tip.style.maxHeight = '400px';
    tip.style.overflowY = 'scroll';
    tip.appendChild(document.createTextNode(`${chapterList.length} chapters`));
    const listRoot = document.createElement('ol');
    listRoot.style.fontSize = 'inherit';
    listRoot.append.apply(listRoot, chapterList.map((chapters, i) => {
        var _a;
        const li = document.createElement('li');
        li.style.fontSize = 'inherit';
        li.innerText = (chapters.length > 1)
            ? `Chapter ${i + 1}: ${chapters[0].num || 'unknown'} - ${chapters[chapters.length - 1].num || 'unknown'}`
            : `Chapter ${i + 1}: ${((_a = chapters[0]) === null || _a === void 0 ? void 0 : _a.num) || 'unknown'}`;
        return li;
    }));
    tip.appendChild(listRoot);
    return tip.outerHTML;
};
const defaultParseChapterNumber = (str) => {
    var _a;
    const num = (_a = /Chapter (\d+)/.exec(str)) === null || _a === void 0 ? void 0 : _a[1];
    const parsedNum = parseInt(num || '');
    return isNaN(parsedNum) ? null : parsedNum;
};
const chapterListGetters = {
    fuyuneko() {
        return [...document.querySelectorAll('.sqs-block-content > p')]
            .filter(el => el.innerText.includes('Chapter'))
            .map(el => {
            return Array.from(el.childNodes)
                .filter(c => { var _a; return c.tagName === 'A' || ((_a = c) === null || _a === void 0 ? void 0 : _a.data); })
                .map((c) => {
                const title = c.data || c.innerText;
                return {
                    title: title,
                    num: defaultParseChapterNumber(title),
                };
            });
        });
    },
    wordexcerpt() {
        const testChapter = (n) => {
            return (txt) => new RegExp(`\\(${n}\\)`).test(txt);
        };
        const testChapter1 = testChapter('1');
        const testChapterAny = testChapter('\\d+');
        const chapters = [...document.querySelectorAll('li.wp-manga-chapter > a')]
            .map((el) => {
            const title = el.innerText;
            return {
                title,
                num: defaultParseChapterNumber(title),
            };
        })
            .reverse();
        return groupBy(chapters, ({ title: chA }, { title: chB }) => {
            return !(!testChapterAny(chA) || !testChapterAny(chB) || testChapter1(chB));
        });
    }
};
(() => {
    const container = document.createElement('div');
    container.id = 'us-chapter-list-root';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.right = '0';
    document.body.append(container);
    window.addEventListener('keyup', (e) => {
        if (e.altKey && e.key.toLowerCase() === 'l') {
            const chapterList = Object.entries(chapterListGetters)
                .find(([key, _]) => window.location.href.includes(key))[1]();
            console.log('Original Chapter List', chapterList.flat());
            console.log('Chapter List', chapterList);
            console.log('Chapter List Obj', chapterList.reduce((acc, el, i) => ({ ...acc, [i + 1]: el }), {}));
            tippy(container, {
                content: chapterListHTML(chapterList),
                allowHTML: true,
                interactive: true,
                showOnCreate: true,
                placement: 'left-end',
            });
        }
    });
})();
