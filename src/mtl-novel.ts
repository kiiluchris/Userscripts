const cleanText: Record<string, (novelText: HTMLDivElement) => void> = {
  'the-male-leads-villainess-stepmother': (novelText) => {
    const lastP = novelText.lastElementChild
    lastP!!.innerHTML = lastP!!.innerHTML.replace(/The website has been changed.*/g, '')
  }
}


;(function() {
  'use strict';

  const re = /www.mtlnovel.com\/([^/]+)\//
  const novelName = re.exec(window.location.href)?.[1];
  const novelText = document.querySelector<HTMLDivElement>('div[class^="par fontsize-"')
  novelName && novelText && cleanText[novelName]?.(novelText);
  window.addEventListener('keyup', (e) => {
    if(e.altKey && e.key.toLowerCase() === 'n' && novelName){
      GM_openInTab(`https://www.novelupdates.com/series/${novelName}/`, {
        active: false,
        setParent: true,
      });
    }
  })
})();




