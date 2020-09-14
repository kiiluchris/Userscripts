// ==UserScript==
// @name           Novelupdates List
// @namespace      http://tampermonkey.net/
// @version        0.1
// @author         kiiluchris
// @description    try to take over the world!
// @match          https://www.novelupdates.com/reading-list/
// @grant          unsafeWindow
// @run-at         document-end
// ==/UserScript==
function jsTimeDiffNow(date) {
    return (Date.now() - date.getTime()) / (24 * 60 * 60 * 1000);
}

const identity = (x) => x;
const mkPrinter = (name) => (msg, ...rest) => {
    console.group(name);
    console.log(msg);
    console.log(...rest);
    console.groupEnd();
};

function filterCompletedTranslations(arr) {
    return arr.filter(novel => novel.isTranslationComplete);
}
function filterCompareDaysSinceUpdate(predicate) {
    return (days) => {
        return (arr) => arr.filter(novel => {
            const daysSinceLastUpdate = novel.daysSinceLastUpdate;
            return daysSinceLastUpdate === -1 || predicate(daysSinceLastUpdate, days);
        });
    };
}
const filterLessDaysSinceUpdate = filterCompareDaysSinceUpdate((daysSinceLastUpdate, days) => daysSinceLastUpdate <= days);
const filterMoreDaysSinceUpdate = filterCompareDaysSinceUpdate((daysSinceLastUpdate, days) => daysSinceLastUpdate >= days);
function filterCompareYearsSinceUpdate(filterFn) {
    return (year) => {
        const timeDiffFromYear = jsTimeDiffNow(new Date(year, 0));
        return (timeDiffFromYear < 0)
            ? identity
            : filterFn(timeDiffFromYear);
    };
}
const filterYearBeforeLastUpdate = filterCompareYearsSinceUpdate(filterMoreDaysSinceUpdate);
const filterYearAfterLastUpdate = filterCompareYearsSinceUpdate(filterLessDaysSinceUpdate);
function filterOneshots(arr) {
    return arr.filter(novel => novel.lastReadChapter === novel.lastReleasedChapter && novel.lastReleasedChapter === 'oneshot');
}
function filterAttrList(attrName) {
    return (matchOn, matchValues) => ((novels) => {
        return novels.filter((novel) => (novel[attrName].some((attr) => (matchValues.some((match) => {
            if (typeof match === 'string')
                return attr[matchOn].includes(match);
            else
                return match.test(attr[matchOn]);
        })))));
    });
}
const filterOnTags = filterAttrList('tags');
const filterOnLanguages = filterAttrList('languages');
const filterOnGenres = filterAttrList('genres');
const filterOnAuthors = filterAttrList('authors');
const filterOnArtists = filterAttrList('artists');

var filters = /*#__PURE__*/Object.freeze({
    __proto__: null,
    filterCompletedTranslations: filterCompletedTranslations,
    filterLessDaysSinceUpdate: filterLessDaysSinceUpdate,
    filterMoreDaysSinceUpdate: filterMoreDaysSinceUpdate,
    filterYearBeforeLastUpdate: filterYearBeforeLastUpdate,
    filterYearAfterLastUpdate: filterYearAfterLastUpdate,
    filterOneshots: filterOneshots,
    filterAttrList: filterAttrList,
    filterOnTags: filterOnTags,
    filterOnLanguages: filterOnLanguages,
    filterOnGenres: filterOnGenres,
    filterOnAuthors: filterOnAuthors,
    filterOnArtists: filterOnArtists
});

function selectCheckboxes(novels) {
    novels.forEach(novel => novel.checkbox.click());
    return novels;
}

var actions = /*#__PURE__*/Object.freeze({
    __proto__: null,
    selectCheckboxes: selectCheckboxes
});

const print = mkPrinter('Novelupdates List');
function novelUpdatesLinksAsAttrs(els) {
    return els.map(el => ({
        link: el.href,
        name: el.innerText,
        description: el.title,
    }));
}
function getNovelTranslationDetails(detailsContainer) {
    const genres = [...detailsContainer.querySelectorAll('#seriesgenre a.genre')];
    const tags = [...detailsContainer.querySelectorAll('#showtags a.genre')];
    const languages = [...detailsContainer.querySelectorAll('#showlang a.genre')];
    const authors = [...detailsContainer.querySelectorAll('#showauthors a.genre')];
    const artists = [...detailsContainer.querySelectorAll('#showartists a.genre')];
    const statusOfOriginal = detailsContainer.querySelector('#editstatus');
    const isTranslationComplete = detailsContainer.querySelector('#showtranslated');
    return {
        statusOfOriginal: statusOfOriginal.innerText.trim(),
        isTranslationComplete: isTranslationComplete.innerText.trim() === "Yes",
        genres: novelUpdatesLinksAsAttrs(genres),
        tags: novelUpdatesLinksAsAttrs(tags),
        languages: novelUpdatesLinksAsAttrs(languages),
        authors: novelUpdatesLinksAsAttrs(authors),
        artists: novelUpdatesLinksAsAttrs(artists),
    };
}
function getNovelTranslationRelatedLinks(firstLink) {
    var _a, _b;
    const result = [firstLink];
    let el = (_a = firstLink.nextElementSibling) === null || _a === void 0 ? void 0 : _a.nextElementSibling;
    while (el && el instanceof HTMLAnchorElement && el.classList.contains('genre')) {
        result.push(el);
        el = (_b = el.nextElementSibling) === null || _b === void 0 ? void 0 : _b.nextElementSibling;
    }
    return result.map(el => {
        var _a;
        const relatedText = (_a = el.nextSibling) === null || _a === void 0 ? void 0 : _a.data;
        const result = {
            link: el.href,
            name: el.innerText
        };
        if (relatedText)
            result.relatedText = relatedText.trim();
        return result;
    });
}
function getElementTextNodesAsStrings(container) {
    return [...container.childNodes].reduce((acc, el) => {
        if (el.constructor === Text)
            acc.push(el.data.trim());
        return acc;
    }, []);
}
function getNovelTranslationRelated(chapterContainer) {
    const otherNames = chapterContainer.querySelector('#editassociated');
    const titles = [...chapterContainer.querySelectorAll('h5.seriesother')];
    const [_otherNameTitle, relatedTitle, recommendationTitle] = titles;
    // Table may not be present
    const lastUpdate = chapterContainer.querySelector('#myTable tbody tr td');
    const result = {
        otherNames: getElementTextNodesAsStrings(otherNames),
        relatedSeries: getNovelTranslationRelatedLinks(relatedTitle.nextElementSibling),
        recommendations: getNovelTranslationRelatedLinks(recommendationTitle.nextElementSibling),
        lastUpdate: "",
        daysSinceLastUpdate: -1,
    };
    if (lastUpdate) {
        result.lastUpdate = lastUpdate.innerText.trim();
        result.daysSinceLastUpdate = jsTimeDiffNow(new Date(result.lastUpdate));
    }
    return result;
}
function getNovelTranslationAttrs(doc = document) {
    const container = doc.querySelector('div.w-blog-content');
    if (!container)
        throw "Main container not found";
    const detailsContainer = doc.querySelector('div.g-cols.wpb_row.offset_default > div.one-third');
    const chapterContainer = doc.querySelector('div.g-cols.wpb_row.offset_default > div.two-thirds');
    if (!detailsContainer)
        throw "Details container not found";
    if (!chapterContainer)
        throw "Chapters container not found";
    const titleEl = container.querySelector('div.seriestitlenu');
    return {
        title: titleEl.innerText.trim(),
        ...getNovelTranslationDetails(detailsContainer),
        ...getNovelTranslationRelated(chapterContainer),
    };
}
function fetchNovelDetailsFromReadingList(doc = document) {
    const rows = [...doc.querySelectorAll('tr.rl_links')];
    const novelDetails = rows.map(async (row) => {
        const checkbox = row.querySelector('td:nth-child(1) input[type="checkbox"]');
        const novelEl = row.querySelector('td:nth-child(2) a');
        const lastReadChapter = row.querySelector('td:nth-child(3) a');
        const lastReleasedChapter = row.querySelector('td:nth-child(4) a');
        const details = await fetch(novelEl.href).then(r => r.text());
        const parser = new DOMParser();
        const detailsDoc = parser.parseFromString(details, 'text/html');
        const translationAttrs = getNovelTranslationAttrs(detailsDoc);
        return {
            name: novelEl.innerText,
            link: novelEl.href,
            lastReadChapter: lastReadChapter.innerText,
            lastReleasedChapter: lastReleasedChapter.innerText,
            checkbox,
            ...translationAttrs
        };
    });
    return Promise.all(novelDetails);
}
unsafeWindow.userscripts = {
    ...unsafeWindow.userscripts,
    novelupdates: {
        cacheNovelDetails() {
            return fetchNovelDetailsFromReadingList(document)
                .then(details => {
                this.details = details;
                print(details);
                return details;
            })
                .catch(console.error);
        },
        details: [],
        filters: filters,
        actions: actions,
        run(fns) {
            return fns.reduce((acc, f) => f(acc), this.details);
        }
    }
};
(() => {
    const toggleSearchMenuBtn = document.getElementsByClassName('menu_right_icons search')[0];
    const searchInput = document.getElementById("searchme-rl newmenu");
    window.addEventListener('keyup', (e) => {
        if (e.key === '/' && e.target !== searchInput) {
            toggleSearchMenuBtn === null || toggleSearchMenuBtn === void 0 ? void 0 : toggleSearchMenuBtn.click();
        }
    });
})();
