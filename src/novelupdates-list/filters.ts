import  { jsTimeDiffNow } from './util'
import  { identity } from '../shared/utils'

export function filterCompletedTranslations(arr: novelupdates.NovelDetails[]) {
  return arr.filter(novel => novel.isTranslationComplete)
}

function filterCompareDaysSinceUpdate(predicate: (daysSinceLastUpdate: number, days: number) => boolean) {
  return (days: number) => {
    return (arr: novelupdates.NovelDetails[]) => arr.filter(novel => {
      const daysSinceLastUpdate = novel.daysSinceLastUpdate
      return daysSinceLastUpdate === -1 || predicate(daysSinceLastUpdate, days)
    })
  }
}

export const filterLessDaysSinceUpdate = filterCompareDaysSinceUpdate(
  (daysSinceLastUpdate, days) => daysSinceLastUpdate <= days
);

export const filterMoreDaysSinceUpdate = filterCompareDaysSinceUpdate(
  (daysSinceLastUpdate, days) => daysSinceLastUpdate >= days
);


function filterCompareYearsSinceUpdate(
  filterFn: (days: number) => (novels: novelupdates.NovelDetails[]) => novelupdates.NovelDetails[]
) {
  return (year: number) => {
    const timeDiffFromYear = jsTimeDiffNow(new Date(year, 0))
    return (timeDiffFromYear < 0)
      ? identity
      : filterFn(timeDiffFromYear);
  }
}

export const filterYearBeforeLastUpdate = filterCompareYearsSinceUpdate(filterMoreDaysSinceUpdate)
export const filterYearAfterLastUpdate = filterCompareYearsSinceUpdate(filterLessDaysSinceUpdate)

export function filterOneshots(arr: novelupdates.NovelDetails[]) {
  return arr.filter(novel => novel.lastReadChapter === novel.lastReleasedChapter && novel.lastReleasedChapter === 'oneshot')
}

export function filterAttrList(attrName: novelupdates.NovelAttr) {
  return (matchOn: keyof novelupdates.NovelLinkAttrs, matchValues: (RegExp | string)[]) => (
    (novels: novelupdates.NovelDetails[]): novelupdates.NovelDetails[] => {
      return novels.filter((novel) => (
        novel[attrName].some((attr) => (
          matchValues.some((match) => {
            if (typeof match === 'string')
              return attr[matchOn].includes(match)
            else
              return match.test(attr[matchOn])
          })
        ))
      ))
    }
  )
}

export const filterOnTags = filterAttrList('tags')
export const filterOnLanguages = filterAttrList('languages')
export const filterOnGenres = filterAttrList('genres')
export const filterOnAuthors = filterAttrList('authors')
export const filterOnArtists = filterAttrList('artists')