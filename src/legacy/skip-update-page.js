
const linkTemplates = {
    kuronomaou: {
      options: {
        selector: '.entry-content a:not(.jp-relatedposts-post-a)',
        filterText: /Chapter \d+$/,
      },
      mapper({url, text}) {
        const chapterNum = text.match(/Chapter (\d+)$/)[1]
        return `https://entruce.wordpress.com/projects/knm-chapters/knm-chapter-${chapterNum}/`
      }
    }
  }
  unsafeWindow.userscripts = unsafeWindow.userscripts || {}
  unsafeWindow.userscripts.skipUpdates = {
    processPages(options) {
      return (templateFn) => {
        return getLinks(options).map(l => ({
          href: templateFn({url: l.href, text: l.innerText})
        }))
      }
    },
    openPages(options){
      return (templateFn) => {
        const linkURLs = this.processPages(options)(templateFn);
        return openLinks([{click(){}}, ...linkURLs], false);
      }
    },
    processPagesFromTemplate(templateName){
      if(!linkTemplates[templateName]) throw new Error(`Template for "${templateName}" does not exist`)
      const {options, mapper} = linkTemplates[templateName];
      return this.processPages(options)(mapper);
    },
    openPagesFromTemplate(templateName){
      const linkURLs = this.processPagesFromTemplate(templateName);
      return openLinks([{click(){}}, ...linkURLs], false);
    },
    getLinks,
    openURLs,
    openURLsInRange(urlFn){
      return (start, end, isSaved = false) => {
        const urls = [...Array(end - start + 1).keys()].map(offset => urlFn(start + offset))
        return openURLs(urls, isSaved)
      }
    }
  };
  