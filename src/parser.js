export default (data, i18nInstance) => {
  const parser = new DOMParser();
  const parsedData = parser.parseFromString(data, 'text/xml');
  const errorNode = parsedData.querySelector('parsererror');
  if (errorNode) {
    throw new Error(i18nInstance.t('content.fail.invalidRss'));
  } else {
    const feedTitle = parsedData.querySelector('channel > title').textContent;
    const feedDescription = parsedData.querySelector('channel > description').textContent;
    const feed = { title: feedTitle, description: feedDescription };
    const postsData = parsedData.querySelectorAll('item');
    const posts = Array.from(postsData)
      .map((post) => {
        const title = post.querySelector('title').textContent;
        const link = post.querySelector('link').textContent;
        const description = post.querySelector('description') ? post.querySelector('description').textContent : title;
        return {
          title, link, description,
        };
      });
    return { feed, posts };
  }
};
