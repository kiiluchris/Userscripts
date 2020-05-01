declare function GM_openInTab(url: string, options: {
  active?: boolean,
  insert?: boolean,
  setParent?: boolean,
}): void

interface ClickableWithHref {
  href: string,
  click(): any,
}
