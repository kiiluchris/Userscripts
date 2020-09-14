


const boxNovelDomain = 'boxnovel';
const vipNovelDomain = 'vipnovel';
const SCRIPT_NAME = 'Swap BoxNovel and VipNovel Userscript';

type Domains =
  | typeof boxNovelDomain
  | typeof vipNovelDomain

type UrlFormatter = (url: string) => string

interface UrlUpdater {
  [boxNovelDomain]: UrlFormatter,
  [vipNovelDomain]: UrlFormatter,
}

const formatterForDomain = (domain: Domains) => {
  const formatters = [] as ({ re: RegExp | string, formatter: UrlUpdater })[];
  return {
    add: (re: RegExp | string, formatter: UrlUpdater) => {
      formatters.push({ re, formatter });
    },
    format: (url: string) => {
      const formatter = formatters.find((f) => {
        if (typeof f.re === 'string') {
          return url.includes(f.re);
        }
        return f.re.test(url);
      });
      return (formatter && formatter.formatter[domain](url)) || url;
    },
  };
};

const findUrlDomain = (
  url: string,
  ...fns: ((url: string) => Domains | null)[]
): Domains | null => {
  if (!fns.length) throw new Error('No url matching functions provided to findUrlDomain(url, ...fns)');
  const match = fns.find((fn) => !!fn(url));
  return match ? match(url) : null;
};

function isNovelDetailsPage(): boolean {
  const { pathname } = window.location;
  const pathSegments = pathname.split('/').filter((seg) => seg);

  return (
    (
      pathname.startsWith('/novel')
      || pathname.startsWith('/vipnovel')
    ) && pathSegments.length === 2
  );
}

((): void => {
  const isUrlOfDomain = (domain: Domains) => (
    (url: string): Domains | null => (url.includes(domain) ? domain : null)
  );
  const isUrlOfBoxNovel = isUrlOfDomain(boxNovelDomain);
  const isUrlOfVipNovel = isUrlOfDomain(vipNovelDomain);

  const url = window.location.href;
  if (isNovelDetailsPage()) {
    window.addEventListener('load', (_) => {
      const chapterList = document.querySelector<HTMLUListElement>('ul.main');
      if (!chapterList) return;
      chapterList.scrollIntoView(true);
    });
  }

  const domain = findUrlDomain(url, isUrlOfBoxNovel, isUrlOfVipNovel);
  if (!domain) return console.log(SCRIPT_NAME, 'Domain not found');
  console.log(SCRIPT_NAME, `Domain is ${domain}`);
  const urlUpdaters: UrlUpdater = {
    boxnovel: (u: string) => u.replace('-webnovel', '').replace(/(?:box)?novel/g, 'vipnovel'),
    vipnovel: (u: string) => u.replace('vipnovel', 'boxnovel').replace('vipnovel', 'novel'),
  };

  const urlUpdater = urlUpdaters[domain];
  const urlFormatter = formatterForDomain(domain);
  urlFormatter.add('experimental-log', {
    boxnovel: (u) => u.replace('the-experimental', 'experimental'),
    vipnovel: (u) => u.replace('experimental', 'the-experimental'),
  });
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'ArrowUp') {
      window.location.href = urlFormatter.format(urlUpdater(url));
    } else if (e.shiftKey && e.key.toUpperCase() === 'L'){
      document.querySelector<HTMLAnchorElement>('ul.main > li > a')?.click();
    } 
  });

  return undefined;
})();
