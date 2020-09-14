declare module novelupdates {
    interface NovelLinkAttrs {
    link: string,
    name: string,
    description: string
    }

    interface NovelTranslationDetails {
    statusOfOriginal: string,
    isTranslationComplete: boolean,
    genres: NovelLinkAttrs[],
    tags: NovelLinkAttrs[],
    languages: NovelLinkAttrs[],
    authors: NovelLinkAttrs[],
    artists: NovelLinkAttrs[],
    }


    interface NovelRelatedLinkInfo {
    link: string,
    name: string,
    relatedText?: string,
    }

    interface NovelRelatedInfo {
    otherNames: string[],
    relatedSeries: NovelRelatedLinkInfo[],
    recommendations: NovelRelatedLinkInfo[],
    lastUpdate: string,
    daysSinceLastUpdate: number,
    }

    interface NovelTranslationAttrs extends NovelRelatedInfo, NovelTranslationDetails {
    title: string,
    }


    interface NovelDetails extends NovelTranslationAttrs {
    name: string,
    link: string,
    lastReadChapter: string,
    lastReleasedChapter: string,
    checkbox: HTMLInputElement,
    }

    type NovelAttr = keyof Omit<novelupdates.NovelTranslationDetails, 'statusOfOriginal' | 'isTranslationComplete'>

}

