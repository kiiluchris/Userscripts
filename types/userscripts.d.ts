
declare const unsafeWindow: Window & { [key: string]: any };

declare function GM_openInTab(url: string, options: {
  active?: boolean,
  insert?: boolean,
  setParent?: boolean,
}): void;
