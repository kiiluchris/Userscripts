import { getLinks, openLinks, openURLs } from './shared/link-open';




unsafeWindow.myUserscriptUtils = {
  getLinks,
  openLinks,
  openURLs,
};
const utils = unsafeWindow.myUserscriptUtils;

const propertyAsString = (el: HTMLElement, property: (keyof HTMLElement)): string => {
  const value = el[property];
  switch (typeof value) {
    case 'string':
      return value;
    case 'number':
    case 'bigint':
      return `${value}`;
    case 'function':
    case 'symbol':
      return value.toString();
    default:
      return JSON.stringify(value);
  }
};

utils.copyElToClipboard = (selector: string, property: (keyof HTMLElement) = 'innerText'): HTMLElement | void => {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) {
    return console.error(`Element ${selector} not found`);
  }
  const input = document.createElement('input');
  input.value = propertyAsString(el, property);
  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  document.body.removeChild(input);

  return el;
};

