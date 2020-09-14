import { sendWindowMessage, getWindowMessage } from './shared/extension-sync';



((): void => {
  const parentUrl = new URL(document.URL).searchParams.get('t_u');
  if (!(
    parentUrl
    && /butterflyscurse.stream\/[^/]+-chapter-\d+(?:-\d+)?\/?$/.test(parentUrl)
  )) return console.log(`QT Userscript: Matched frame but invalid parentPage "${parentUrl}"`);
  window.addEventListener('load', async (_e) => {
    const threadData = document.getElementById('disqus-threadData');
    if (!threadData) return console.log('Threaddata element not found');
    const data = JSON.parse(threadData.innerText);
    const { posts } = data.response;
    const post = posts.find((p: any) => p.author.isPrimary && p.isApproved);
    if (!post) {
      console.error('Available posts: ', posts);
      throw new Error('Moderator post not found');
    }
    const parser = new DOMParser();
    const doc = parser.parseFromString(post.raw_message, 'text/html');
    const links = [...doc.getElementsByTagName('a')];
    const urls = links.map((el) => decodeURIComponent(el.href));
    const validUrls = urls.filter((url) => /^https?:\/\/butterflyscurse\.stream\/novel-translations\/qtf-table-of-contents\/qtf/.test(url));
    if (!validUrls.length) return undefined;
    await getWindowMessage<{ hasLoaded: boolean }>((d) => d.hasLoaded);
    sendWindowMessage({ urls: validUrls }, {
      mWindow: window.parent,
    });
    return undefined;
  });
  return undefined;
})();
