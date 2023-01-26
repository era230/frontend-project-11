import uniqueId from 'lodash/uniqueId';

export default (data, url, i18nInstance) => {
  const parser = new DOMParser();
  const parseData = parser.parseFromString(data, 'text/xml');
  if (!parseData.querySelector('rss')) {
    throw new Error(i18nInstance.t('content.fail.invalidRss'));
  }
  const feedTitle = parseData.querySelector('channel > title').textContent;
  const feedDescription = parseData.querySelector('channel > description').textContent;
  const feed = { title: feedTitle, description: feedDescription, id: url };
  const postsData = parseData.querySelectorAll('item');
  const posts = Array.from(postsData)
    .map((post) => {
      const title = post.querySelector('title').textContent;
      const link = post.querySelector('link').textContent;
      const description = post.querySelector('description') ? post.querySelector('description').textContent : title;
      return {
        title, link, description, id: url, postId: uniqueId(),
      };
    });
  return { feed, posts };
};
