import { waybackify, identity } from './shared/utils';



type KeyboardConditional = (event: KeyboardEvent) => Boolean;

type GetChapters = (event: KeyboardEvent) => string[];


interface ChapterSelectorMap {
  re: RegExp,
  selectors?: [string, string],
  getChapters?: GetChapters,
  handler?: (prev: boolean, next: boolean) => void,
  cond?: KeyboardConditional
}

interface SplitChapterSelectors {
  prevPartSelector: string,
  nextPartSelector: string,
}

(function () {
  const clickElBySelector = (selector: string) => {
    const el = document.querySelector(selector) as HTMLElement;
    el.click();
  };

  const selectChapter = (prev: string, next: string, cond: KeyboardConditional) => (
    (e: KeyboardEvent): void => {
      if (!cond(e)) return;
      switch (e.key) {
        case 'ArrowLeft':
          clickElBySelector(prev);
          break;
        case 'ArrowRight':
          clickElBySelector(next);
          break;
        default:
          break;
      }
    }
  );
  const selectChapterFactory = (
    cond: KeyboardConditional = ((e) => e.shiftKey),
    getChapters: GetChapters | null = null,
  ) => ((
    prevSelector: string,
    nextSelector: string,
    splitChapterSelectors?: SplitChapterSelectors,
  ) => {
    const { prevPartSelector, nextPartSelector } = splitChapterSelectors || {};
    let canOpenChapters = false;
    const nextChapterFn = selectChapter(prevSelector, nextSelector, cond);
    const nextPartFn = splitChapterSelectors
      ? selectChapter(prevPartSelector!!, nextPartSelector!!, (e) => e.shiftKey && e.ctrlKey)
      : identity;
    return (e: KeyboardEvent) => {
      nextPartFn(e);
      nextChapterFn(e);
      if (getChapters) {
        if (cond(e) && e.key === 'ArrowDown') window.close();
        if (cond(e) && e.key === 'ArrowUp') canOpenChapters = !canOpenChapters;
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

  const chapterSelectorMap: ChapterSelectorMap[] = [
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
        const select = document.querySelector('ul.chapter-actions select') as HTMLSelectElement;
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
        const links = [...document.querySelectorAll('#accordion div.card-header')] as HTMLDivElement[];
        const currentIndex = links.findIndex((el) => el.getAttribute('aria-expanded') === 'true');
        const getIndex = () => {
          if (!~currentIndex) return 0;
          if (prev && currentIndex > 0) return currentIndex - 1;
          if (next && currentIndex < links.length - 1) return currentIndex + 1;
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
    {
      re: /www.novelhall.com\/[^/]+\/\d+.html/,
      selectors: ['.nav-single a[rel="prev"]', '.nav-single a[rel="next"]'],
    }
  ];

  const getChapterSelector = (url: string) => {
    const match = chapterSelectorMap.find(({ re }) => waybackify(re).test(url));
    if (!match) {
      console.log('Chapter Transition Userscript: No URL matched');
      return identity;
    }
    const {
      re, selectors, cond, getChapters, handler,
    } = match;
    console.log(`Chapter Transition Userscript: URL ${re} matched`);
    return handler ? ((e: KeyboardEvent) => {
      const [prev, next] = [e.key === 'ArrowLeft', e.key === 'ArrowRight'];
      e.shiftKey && (prev || next) && handler(prev, next);
    }) : selectChapterFactory(cond, getChapters)(...selectors!!);
  };

  window.addEventListener('keyup', getChapterSelector(window.location.href));
}());
