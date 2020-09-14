interface SkipUpdateGetLinksOpts<E extends HTMLElement> {
  elements?: E[],
  selector?: string,
  filterHref?: {
    test: (url: string) => boolean
  },
  filter?: (el: E) => boolean,
  onlyOnce?: boolean,
  filterText?: RegExp,
  condition?: () => boolean
}
