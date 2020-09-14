// ==UserScript==
// @name           Transition Chapter
// @namespace      http://tampermonkey.net/
// @version        0.1.1
// @author         You
// @description    try to take over the world!
// @match          http*://**/*
// @grant          GM_openInTab
// @grant          window.close
// @noframes       
// ==/UserScript==
const regexConcat = (re1) => {
    const re1Str = typeof re1 === 'string' ? re1 : String(re1).slice(1, -1);
    return (re2) => {
        const re2Str = typeof re2 === 'string' ? re2 : String(re2).slice(1, -1);
        return new RegExp(re1Str + re2Str);
    };
};
const waybackify = (re) => {
    const reStr = String(re).slice(1, -1);
    return regexConcat(/(?:web.archive.org\/web\/\d+\/.*)?/)(reStr.replace(/(?:\\\/|$)/, '(:80)?\\/'));
};
const identity = (x) => x;

(function () {
    const clickElBySelector = (selector) => {
        const el = document.querySelector(selector);
        el.click();
    };
    const selectChapter = (prev, next, cond) => ((e) => {
        if (!cond(e))
            return;
        switch (e.key) {
            case 'ArrowLeft':
                clickElBySelector(prev);
                break;
            case 'ArrowRight':
                clickElBySelector(next);
                break;
        }
    });
    const selectChapterFactory = (cond = ((e) => e.shiftKey), getChapters = null) => ((prevSelector, nextSelector, splitChapterSelectors) => {
        const { prevPartSelector, nextPartSelector } = splitChapterSelectors || {};
        let canOpenChapters = false;
        const nextChapterFn = selectChapter(prevSelector, nextSelector, cond);
        const nextPartFn = splitChapterSelectors
            ? selectChapter(prevPartSelector, nextPartSelector, (e) => e.shiftKey && e.ctrlKey)
            : identity;
        return (e) => {
            nextPartFn(e);
            nextChapterFn(e);
            if (getChapters) {
                if (cond(e) && e.key === 'ArrowDown')
                    window.close();
                if (cond(e) && e.key === 'ArrowUp')
                    canOpenChapters = !canOpenChapters;
                if (canOpenChapters && e.key.match(/^[0-9]$/)) {
                    canOpenChapters = false;
                    getChapters(e).slice(0, +e.key).reverse().forEach((ch) => {
                        GM_openInTab(ch, {
                            active: false,
                            insert: true,
                            setParent: true,
                        });
                    });
                }
            }
        };
    });
    const chapterSelectorMap = [
        {
            re: /mangakakalot.com\/chapter/,
            selectors: ['div.btn-navigation-chap > a.next', 'div.btn-navigation-chap > a.back'],
        },
        {
            re: /lightnovelgate\.com\/chapter/,
            selectors: ['.menu_doc a.btn_doc.btn_theodoi:nth-child(1)', '.menu_doc a.btn_doc.btn_theodoi:nth-child(2)'],
        },
        {
            re: /kobatochan.com\/[a-zA-Z0-9-]+-chapter-\d+/,
            selectors: ['.entry-content h3[style="text-align:center;"] a:nth-child(1)', '.entry-content h3[style="text-align:center;"] a:nth-last-child(1)'],
        },
        {
            re: /readlightnovel\.org\/[^/]+\/chapter/,
            selectors: ['ul.chapter-actions a.prev', 'ul.chapter-actions a.next'],
            getChapters: (_e) => {
                const select = document.querySelector('ul.chapter-actions select');
                return [...select.options].slice(select.selectedIndex + 1).map((opt) => opt.value);
            },
        },
        {
            re: /manganelo.com\/chapter/,
            selectors: ['div.btn-navigation-chap > a.next, a.navi-change-chapter-btn-prev', 'div.btn-navigation-chap > a.back, a.navi-change-chapter-btn-next'],
        },
        {
            re: /scrya.org\/[^/]+\/[\w-]+-chapter-\d+/,
            selectors: ['.entry-content p a:nth-child(1)', '.entry-content p a:nth-last-child(1)'],
        },
        {
            re: /www\.asianhobbyist\.com\/[a-zA-Z]+-\d+?\/(?:\d+\/)?$/,
            selectors: ['.acp_previous_page  a', '.acp_next_page  a'],
        },
        {
            re: /reantoanna.wordpress.com\/20\d{2}\/\d{2}\/\d{2}/,
            selectors: ['a[rel="prev"]', 'a[rel="next"]'],
        },
        {
            re: /anotherworldtranslations.wordpress.com\/[a-z\d-]+\/?$/,
            selectors: ['p strong a', 'p strong a:nth-last-child(1)'],
        },
        {
            re: /totallytranslations.com\/[^/]+-chapter/,
            selectors: ['.single-navigation a[rel="prev"]', '.single-navigation a[rel="next"]'],
        },
        {
            re: /justreads.net\/translations\/[^/]+\/[^/]+.php/,
            handler(prev, next) {
                const links = [...document.querySelectorAll('#accordion div.card-header')];
                const currentIndex = links.findIndex((el) => el.getAttribute('aria-expanded') === 'true');
                const getIndex = () => {
                    if (!~currentIndex)
                        return 0;
                    if (prev && currentIndex > 0)
                        return currentIndex - 1;
                    if (next && currentIndex < links.length - 1)
                        return currentIndex + 1;
                    return -1;
                };
                const index = getIndex();
                ~index && links[index].click();
            },
        }, {
            re: /volarenovels.com\/[^/]+\/[a-z\d-]+-chapter/,
            selectors: ['.entry-content p[style="text-align: center;"] a:nth-child(1)', '.entry-content p[style="text-align: center;"] a:nth-last-child(1)'],
        },
        {
            re: /www.shinsori.com\/.+-chapter-\d+\/?/,
            selectors: ['.entry-content a.shortc-button.black:nth-child(1)', '.entry-content a.shortc-button.black:nth-last-child(1)'],
        }, {
            re: /butterflyscurse.stream\/novel-translations\/[^/]+-table-of-contents\/[a-z]+\d+/,
            selectors: ['.entry-content p[style*="text-align: center"] a:nth-child(1)', '.entry-content p[style*="text-align: center"] a:nth-last-child(1)'],
        }, {
            re: /www\.meejee\.net\/read\.html\?book=\d+&chapter=\d+/,
            selectors: ['#pre', '#next'],
        }, {
            re: /wuxiaworld.online\/[^/]+\/.*chapter/,
            selectors: ['.switch-title:nth-child(1) a', '.switch-title:nth-last-child(1) a'],
        }, {
            re: /chap.manganelo.com\/manga-[a-zA-Z0-9]+\/chapter-\d+/,
            selectors: ['a.navi-change-chapter-btn-prev', 'a.navi-change-chapter-btn-next'],
        },
        {
            re: /mtlnovel.com\/[^/]+\/chapter/,
            selectors: ['.chapter-nav a[rel="prev"]', '.chapter-nav a[rel="next"]'],
        },
    ];
    const getChapterSelector = (url) => {
        const match = chapterSelectorMap.find(({ re }) => waybackify(re).test(url));
        if (!match) {
            console.log('Chapter Transition Userscript: No URL matched');
            return identity;
        }
        const { re, selectors, cond, getChapters, handler, } = match;
        console.log(`Chapter Transition Userscript: URL ${re} matched`);
        return handler ? ((e) => {
            const [prev, next] = [e.key === 'ArrowLeft', e.key === 'ArrowRight'];
            e.shiftKey && (prev || next) && handler(prev, next);
        }) : selectChapterFactory(cond, getChapters)(...selectors);
    };
    window.addEventListener('keyup', getChapterSelector(window.location.href));
}());
