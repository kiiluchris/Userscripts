interface NumberOfRetries {
  value: number;
  succ(): NumberOfRetries;
  reset(): NumberOfRetries;
  done(): boolean;
}

const NumberOfRetries = (maxRetries: number): NumberOfRetries => {
  const init = 0;
  return {
    value: init,
    succ(){ this.value++; return this; },
    reset(){ this.value = init; return this; },
    done() { return this.value >= maxRetries },
  };
};
  
type Condition<E extends Event> = (el: HTMLImageElement, evt: E) => boolean;

type ImageLoadEvents = 'error' | 'load';

(() => {
  const MAX_RETRIES = 5;
  const unloadedImages = new Set<HTMLImageElement>();
  
  const findImages = () => ([...document.getElementsByTagName('img')]);
  
  const monitorEvent = <E extends Event>(eventName: ImageLoadEvents, condition:  Condition<E>, numRetries: NumberOfRetries) => {
    return (el: HTMLImageElement) => {
      el.addEventListener(eventName, (e) => {
        if(!window.navigator.onLine){
          numRetries.reset();
          unloadedImages.add(el);
          return;
        }
        if(condition(el, e as E) && numRetries.succ().done()) return;
        const url = new URL(el.src);
        url.searchParams.set('reload_timestamp', Date.now() + '');
        el.src = url.href;
      })
    }
  };
  
  const otherwise: Condition<Event> = () => true;
  const imageNotCompletelyLoaded: Condition<Event> = (img) => !img.complete;
  
  const monitorEvents = (maxRetries: number) => (el: HTMLImageElement) => {
    const numRetries = NumberOfRetries(maxRetries);
    monitorEvent('error', otherwise, numRetries)(el);
    window.addEventListener('load', () => {
      monitorEvent('load', imageNotCompletelyLoaded, numRetries)(el)
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
