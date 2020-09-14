import { openLinksFactory } from "../util";

export const rhexTranslationsConfig: SkipUpdateConfigOptions[] = [
    {
        urls: [
            /rhextranslations.com\/[^/]+-(ann|release|\d+)\/?$/,
        ],
        cb: openLinksFactory({
            condition: () => {
                var titleEls = [...document.querySelectorAll('header.entry-header .entry-title')]
                return titleEls.length === 1 && titleEls[0].nextElementSibling !== null
            },
            onlyOnce: true,
            selector: '.entry-content',
            filter: (el: HTMLAnchorElement) => location.href.includes(el.href.slice(0, -1))
        })
    }
]