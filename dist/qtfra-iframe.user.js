// ==UserScript==
// @name           QT Cannon Fodder's Record of Attacks Open From Comments
// @namespace      http://tampermonkey.net/
// @version        0.1
// @author         You
// @description    try to take over the world!
// @include        /disqus.com\/embed\/comments\/\?base=default&f=butterflyscurse.stream/
// @grant          none
// ==/UserScript==
// eslint-disable-next-line import/prefer-default-export
const EXTENSION_NAME = 'Comic Manager';

const setWindowMessageListenerOfType = (messageType = null) => ((condition) => (fn) => {
    if (!condition)
        throw new Error('No condition function given');
    const listener = ({ data: { extension, messageType: m, data, }, }) => {
        if (extension === EXTENSION_NAME && m === messageType && condition(data)) {
            fn(data, listener);
        }
    };
    window.addEventListener('message', listener);
});
const getWindowMessageOfType = (messageType = null) => ((condition) => new Promise((res) => {
    setWindowMessageListenerOfType(messageType)(condition)((data, listener) => {
        console.log(data);
        res(data);
        window.removeEventListener('message', listener);
    });
}));
const getWindowMessage = getWindowMessageOfType();
const sendWindowMessageWithType = (messageType = null) => (data, { mWindow = window, target = '*' } = {}) => {
    mWindow.postMessage({
        extension: EXTENSION_NAME,
        messageType,
        data,
    }, target);
};
const sendWindowMessage = sendWindowMessageWithType(null);

(() => {
    const parentUrl = new URL(document.URL).searchParams.get('t_u');
    if (!(parentUrl
        && /butterflyscurse.stream\/[^/]+-chapter-\d+(?:-\d+)?\/?$/.test(parentUrl)))
        return console.log(`QT Userscript: Matched frame but invalid parentPage "${parentUrl}"`);
    window.addEventListener('load', async (_e) => {
        const threadData = document.getElementById('disqus-threadData');
        if (!threadData)
            return console.log('Threaddata element not found');
        const data = JSON.parse(threadData.innerText);
        const { posts } = data.response;
        const post = posts.find((p) => p.author.isPrimary && p.isApproved);
        if (!post) {
            console.error('Available posts: ', posts);
            throw new Error('Moderator post not found');
        }
        const parser = new DOMParser();
        const doc = parser.parseFromString(post.raw_message, 'text/html');
        const links = [...doc.getElementsByTagName('a')];
        const urls = links.map((el) => decodeURIComponent(el.href));
        const validUrls = urls.filter((url) => /^https?:\/\/butterflyscurse\.stream\/novel-translations\/qtf-table-of-contents\/qtf/.test(url));
        if (!validUrls.length)
            return undefined;
        await getWindowMessage((d) => d.hasLoaded);
        sendWindowMessage({ urls: validUrls }, {
            mWindow: window.parent,
        });
        return undefined;
    });
    return undefined;
})();
