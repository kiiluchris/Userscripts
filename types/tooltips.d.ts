declare namespace Tippy {
  interface Tooltip {
    show(): void;
    hide(): void;
  }

  interface TooltipRootElement extends HTMLElement {
    _tippy: Tooltip;
  }
}

declare function tippy<T>(el: HTMLElement, options: { [key: string]: any }): T
