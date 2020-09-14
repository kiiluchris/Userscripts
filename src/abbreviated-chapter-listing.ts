import { groupBy } from './shared/utils'

const chapterListHTML = (chapterList: ChapterList[][]) => {
  const tip = document.createElement('div')
  tip.style.fontSize = '12px'
  tip.style.maxHeight = '400px'
  tip.style.overflowY = 'scroll';
  tip.appendChild(document.createTextNode(`${chapterList.length} chapters`))
  const listRoot = document.createElement('ol');
  listRoot.style.fontSize = 'inherit'
  listRoot.append.apply(listRoot, chapterList.map((chapters, i) => {
    const li = document.createElement('li');
    li.style.fontSize = 'inherit'
    li.innerText = (chapters.length > 1)
      ? `Chapter ${i + 1}: ${chapters[0].num || 'unknown'} - ${chapters[chapters.length - 1].num || 'unknown'}`
      : `Chapter ${i + 1}: ${chapters[0]?.num || 'unknown'}`
    return li
  }))
  tip.appendChild(listRoot)
  return tip.outerHTML
};

const defaultParseChapterNumber = (str: string) => {
  const num = /Chapter (\d+)/.exec(str)?.[1]
  const parsedNum = parseInt(num || '');
  return isNaN(parsedNum) ? null : parsedNum;
};

interface ChapterList {
  num: number | null;
  title: string;
};

const chapterListGetters: Record<string, () => ChapterList[][]> = {
  fuyuneko(){
    return [...document.querySelectorAll<HTMLParagraphElement>('.sqs-block-content > p')]
      .filter(el => el.innerText.includes('Chapter'))
      .map(el => {
        return Array.from(el.childNodes)
           .filter(c => (c as HTMLElement).tagName === 'A' || (c as Text)?.data)
           .map((c) => {
             const title = (c as Text).data || (c as HTMLAnchorElement).innerText
             return {
               title: title,
               num: defaultParseChapterNumber(title),
             }
           })
      });
  },
  wordexcerpt(){
    const testChapter = (n: string) => {
      return (txt: string) => new RegExp(`\\(${n}\\)`).test(txt)
    };
    const testChapter1 = testChapter('1')
    const testChapterAny = testChapter('\\d+')
    const chapters = [...document.querySelectorAll<HTMLAnchorElement>('li.wp-manga-chapter > a')]
      .map((el) => {
        const title = el.innerText;
        return {
          title,
          num: defaultParseChapterNumber(title),
        }
      })
      .reverse()
    return groupBy(chapters, ({title: chA}, {title: chB}) => {
      return  !(!testChapterAny(chA) || !testChapterAny(chB) || testChapter1(chB))
    })
  }
}

;(() => {
  const container = document.createElement('div');
  container.id = 'us-chapter-list-root'
  container.style.position = 'fixed'
  container.style.top = '0'
  container.style.right = '0'
  document.body.append(container)

  window.addEventListener('keyup', (e) => {
    if(e.altKey && e.key.toLowerCase() === 'l'){
      const chapterList = Object.entries(chapterListGetters)
        .find(([key, _]) => window.location.href.includes(key))!![1]();
      console.log('Original Chapter List', chapterList.flat());
      console.log('Chapter List', chapterList);
      console.log('Chapter List Obj', chapterList.reduce((acc, el, i) => ({ ...acc, [i + 1]: el }), {}));
      tippy(container, {
          content: chapterListHTML(chapterList),
          allowHTML: true,
          interactive: true,
          showOnCreate: true,
          placement: 'left-end',
      })
    }
  })
})();
