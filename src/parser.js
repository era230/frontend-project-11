import uniqueId from 'lodash/uniqueId';

const parse = (data) => {
  const parser = new DOMParser();
  return parser.parseFromString(data, 'text/xml');
};

export default (i18nInstance, data, id) => {
  const parseData = parse(data);
  if (!parseData.querySelector('rss')) {
    throw new Error(i18nInstance.t('content.fail.invalidRss'));
  }
  const feedTitle = parseData.querySelector('channel > title').textContent;
  const feedDescription = parseData.querySelector('channel > description').textContent;
  const feed = { title: feedTitle, description: feedDescription, id };
  const postsData = parseData.querySelectorAll('item');
  const posts = Array.from(postsData)
    .map((post) => {
      const title = post.querySelector('title').textContent;
      const link = post.querySelector('link').textContent;
      const description = post.querySelector('description').textContent;
      const postId = uniqueId();
      return {
        title, link, description, id, postId,
      };
    });
  return { feed, posts };
};
