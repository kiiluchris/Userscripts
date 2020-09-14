


interface NumberOfRetries {
  value: number;
  succ(): NumberOfRetries;
  reset(): NumberOfRetries;
  eq(x: number): boolean;
  lt(x: number): boolean;
  lte(x: number): boolean;
  gt(x: number): boolean;
  gte(x: number): boolean;
}

const NumberOfRetries = (init: number): NumberOfRetries => {
  return {
    value: init,
    succ(){ this.value++; return this; },
    eq(x: number){ return this.value === x },
    lt(x: number){ return this.value < x },
    lte(x: number){ return this.value <= x },
    gt(x: number){ return this.value > x },
    gte(x: number){ return this.value >= x },
    reset(){ this.value = init; return this; }
  };
};
  
type Condition<E extends Event> = (el: HTMLImageElement, evt: E) => boolean;

type ImageLoadEvents = 'error' | 'load';

(() => {
  const MAX_RETRIES = 5;
  const unloadedImages = new Set<HTMLImageElement>();
  
  const findImages = () => ([...document.getElementsByTagName('img')]);
  
  const monitorEvent = <E extends Event>(eventName: ImageLoadEvents, condition:  Condition<E>, numRetries: NumberOfRetries, maxRetries: number) => {
    return (el: HTMLImageElement) => {
      el.addEventListener(eventName, (e) => {
        if(!window.navigator.onLine){
          numRetries.reset();
          unloadedImages.add(el);
          return;
        }
        if(condition(el, e as E) && numRetries.succ().gt(maxRetries)) return;
        const url = new URL(el.src);
        url.searchParams.set('reload_timestamp', Date.now() + '');
        el.src = url.href;
      })
    }
  };
  
  const otherwise: Condition<Event> = () => true;
  const imageNotCompletelyLoaded: Condition<Event> = (img) => !img.complete;
  
  const monitorEvents = (maxRetries: number) => (el: HTMLImageElement) => {
    const numRetries = NumberOfRetries(0);
    monitorEvent('error', otherwise, numRetries, maxRetries)(el);
    window.addEventListener('load', () => {
      monitorEvent('load', imageNotCompletelyLoaded, numRetries, maxRetries)(el)
    });
  };
  
  findImages().forEach(monitorEvents(MAX_RETRIES));
  
  window.addEventListener("online", function(e) {
    unloadedImages.forEach(img => {
      img.dispatchEvent(new Event('error'))
    });
    unloadedImages.clear();
  });
})();