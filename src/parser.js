export default (data) => {
  const parser = new DOMParser();
  const parseData = parser.parseFromString(data, 'text/xml');
  const feedTitle = parseData.querySelector('channel > title').textContent;
  const feedDescription = parseData.querySelector('channel > description').textContent;
  const postsData = parseData.querySelectorAll('item');
  const posts = Array.from(postsData)
    .map((post) => {
      const title = post.querySelector('title').textContent;
      const link = post.querySelector('link').textContent;
      const description = post.querySelector('description').textContent;
      return { title, link, description };
    });
  return { feed: { title: feedTitle, description: feedDescription }, posts };
};
