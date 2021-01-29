import { jsTimeDiffNow } from './util'
import { mkPrinter } from '../shared/utils'
import * as filters from './filters'
import * as actions from './actions'

const print = mkPrinter('Novelupdates List')

function novelUpdatesLinksAsAttrs(els: HTMLAnchorElement[]): novelupdates.NovelLinkAttrs[] {
    return els.map(el => ({
        link: el.href,
        name: el.innerText,
        description: el.title,
    }))
}

function getNovelTranslationDetails(detailsContainer: HTMLElement): novelupdates.NovelTranslationDetails {
    const genres = [...detailsContainer.querySelectorAll('#seriesgenre a.genre')] as HTMLAnchorElement[];
    const tags = [...detailsContainer.querySelectorAll('#showtags a.genre')] as HTMLAnchorElement[];
    const languages = [...detailsContainer.querySelectorAll('#showlang a.genre')] as HTMLAnchorElement[];
    const authors = [...detailsContainer.querySelectorAll('#showauthors a.genre')] as HTMLAnchorElement[];
    const artists = [...detailsContainer.querySelectorAll('#showartists a.genre')] as HTMLAnchorElement[];
    const statusOfOriginal = detailsContainer.querySelector('#editstatus') as HTMLElement
    const isTranslationComplete = detailsContainer.querySelector('#showtranslated') as HTMLElement

    return {
        statusOfOriginal: statusOfOriginal.innerText.trim(),
        isTranslationComplete: isTranslationComplete.innerText.trim() === "Yes",
        genres: novelUpdatesLinksAsAttrs(genres),
        tags: novelUpdatesLinksAsAttrs(tags),
        languages: novelUpdatesLinksAsAttrs(languages),
        authors: novelUpdatesLinksAsAttrs(authors),
        artists: novelUpdatesLinksAsAttrs(artists),
    }
}


function getNovelTranslationRelatedLinks(firstLink: HTMLAnchorElement) {
    const result = [firstLink]
    let el = firstLink.nextElementSibling?.nextElementSibling;
    while (el && el instanceof HTMLAnchorElement && el.classList.contains('genre')) {
        result.push(el as HTMLAnchorElement)
        el = el.nextElementSibling?.nextElementSibling;
    }

    return result.map(el => {
        const relatedText = (el.nextSibling as Text | null)?.data;
        const result: novelupdates.NovelRelatedLinkInfo = {
            link: el.href,
            name: el.innerText
        };
        if (relatedText) result.relatedText = relatedText.trim()
        return result;
    })
}


function getElementTextNodesAsStrings(container: HTMLElement) {
    return [...container.childNodes].reduce((acc, el) => {
        if (el.constructor === Text) acc.push((el as Text).data.trim())
        return acc
    }, [] as string[])
}


function getNovelTranslationRelated(chapterContainer: HTMLElement): novelupdates.NovelRelatedInfo {
    const otherNames = chapterContainer.querySelector('#editassociated') as HTMLElement
    const titles = [...chapterContainer.querySelectorAll('h5.seriesother')] as HTMLHeadingElement[]
    const [_otherNameTitle, relatedTitle, recommendationTitle] = titles;
    // Table may not be present
    const lastUpdate = chapterContainer.querySelector('#myTable tbody tr td') as HTMLTableRowElement
    const result = {
        otherNames: getElementTextNodesAsStrings(otherNames),
        relatedSeries: getNovelTranslationRelatedLinks(relatedTitle.nextElementSibling!! as HTMLAnchorElement),
        recommendations: getNovelTranslationRelatedLinks(recommendationTitle.nextElementSibling!! as HTMLAnchorElement),
        lastUpdate: "",
        daysSinceLastUpdate: -1,
    };
    if (lastUpdate) {
        result.lastUpdate = lastUpdate.innerText.trim()
        result.daysSinceLastUpdate = jsTimeDiffNow(new Date(result.lastUpdate))
    }

    return result
}

function getNovelTranslationAttrs(doc = document) {
    const container = doc.querySelector('div.w-blog-content')
    if (!container) throw "Main container not found"
    const detailsContainer = doc.querySelector('div.g-cols.wpb_row.offset_default > div.one-third') as HTMLDivElement | null
    const chapterContainer = doc.querySelector('div.g-cols.wpb_row.offset_default > div.two-thirds') as HTMLDivElement | null
    if (!detailsContainer) throw "Details container not found"
    if (!chapterContainer) throw "Chapters container not found"
    const titleEl = container.querySelector('div.seriestitlenu') as HTMLDivElement
    return {
        title: titleEl.innerText.trim(),
        ...getNovelTranslationDetails(detailsContainer),
        ...getNovelTranslationRelated(chapterContainer),
    }
}

function fetchNovelDetailsFromReadingList(doc = document): Promise<novelupdates.NovelDetails[]> {
    const rows = [...doc.querySelectorAll('tr.rl_links')];
    const novelDetails = rows.map(async (row): Promise<novelupdates.NovelDetails> => {
        const checkbox = row.querySelector('td:nth-child(1) input[type="checkbox"]') as HTMLInputElement
        const novelEl = row.querySelector('td:nth-child(2) a') as HTMLAnchorElement
        const lastReadChapter = row.querySelector('td:nth-child(3) a') as HTMLAnchorElement
        const lastReleasedChapter = row.querySelector('td:nth-child(4) a') as HTMLAnchorElement
        const details = await fetch(novelEl.href).then(r => r.text());
        const parser = new DOMParser();
        const detailsDoc = parser.parseFromString(details, 'text/html')
        const translationAttrs = getNovelTranslationAttrs(detailsDoc)

        return {
            name: novelEl.innerText,
            link: novelEl.href,
            lastReadChapter: lastReadChapter.innerText,
            lastReleasedChapter: lastReleasedChapter.innerText,
            checkbox,
            ...translationAttrs
        }
    })

    return Promise.all(novelDetails)
}

unsafeWindow.userscripts = {
    ...unsafeWindow.userscripts,
    novelupdates: {
        cacheNovelDetails() {
            return fetchNovelDetailsFromReadingList(document)
                .then(details => {
                    this.details = details
                    print(details)
                    return details
                })
                .catch((e) => { console.error(e); return []; })
        },
        details: [] as novelupdates.NovelDetails[],
        filters: filters,
        actions: actions,
        runP(
            fns: ((details: novelupdates.NovelDetails[]) => novelupdates.NovelDetails[])[],
            novels?: novelupdates.NovelDetails[]
        ) {
            const novels_ = novels ? novels : this.details
            const details = !novels_.length
                ? this.cacheNovelDetails()
                : Promise.resolve(novels_);
            return details.then((novels) => {
                const res = this.run(fns, novels)
                console.log(res)
                return res
            });
        },
        run(
            fns: ((details: novelupdates.NovelDetails[]) => novelupdates.NovelDetails[])[],
            novels?: novelupdates.NovelDetails[]
        ) {
            return fns.reduce((acc, f) => f(acc), novels || this.details)
        }
    }
};

(() => {
    const toggleSearchMenuBtn = document.getElementsByClassName('menu_right_icons search')[0] as HTMLElement | undefined
    const searchInput = document.getElementById("searchme-rl newmenu")

    window.addEventListener('keyup', (e) => {
        if (e.key === '/' && e.target !== searchInput) {
            toggleSearchMenuBtn?.click()
        }
    })
})();
