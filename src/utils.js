const makeEl = (type, classes, attributes = []) => {
  const el = document.createElement(type);
  classes.forEach((className) => {
    el.classList.add(className);
  });
  if (attributes.length > 0) {
    attributes.forEach(({ name, value }) => {
      el.setAttribute(name, value);
    });
  }
  return el;
};

const fillContainer = (containerTitle, ulFragment) => {
  const cardEl = makeEl('div', ['card', 'border-0']);
  const cardBody = makeEl('div', ['card-body']);
  const cardTitle = makeEl('h2', ['card-title']);
  cardTitle.textContent = containerTitle;
  cardBody.append(cardTitle);
  cardEl.append(cardBody, ulFragment);
  return cardEl;
};

const makeFeedsUl = (feeds) => {
  const ul = makeEl('ul', ['list-group', 'border-0', 'rounded-0']);
  feeds.forEach(({ title, description }) => {
    const li = makeEl('li', ['list-group-item', 'border-0', 'border-end-0']);
    const titleEl = makeEl('h3', ['h6', 'm-0']);
    titleEl.textContent = title;
    const descriptionEl = makeEl('p', ['m-0', 'small', 'text-black-50']);
    descriptionEl.textContent = description;
    li.append(titleEl, descriptionEl);
    ul.prepend(li);
  });
  return ul;
};

const makePostsUl = (i18nInstance, posts) => {
  const ul = makeEl('ul', ['list-group', 'border-0', 'rounded-0']);
  posts.forEach((post) => {
    const { title, link, feedId } = post;
    const li = makeEl('li', ['list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0']);
    const linkEl = makeEl('a', ['fw-bold'], [{ name: 'target', value: '_blank' }, { name: 'rel', value: 'noopener' }, { name: 'rel', value: 'noreferrer' }]);
    linkEl.setAttribute('href', link);
    linkEl.setAttribute('data-id', feedId);
    linkEl.textContent = title;
    const button = makeEl('button', ['btn', 'btn-outline-primary', 'btn-sm'], [{ name: 'type', value: 'button' }, { name: 'data-id', value: feedId }, { name: 'data-bs-toggle', value: 'modal' }, { name: 'data-bs-target', value: '#modal' }]);
    button.textContent = i18nInstance.t('button');
    li.append(linkEl, button);
    ul.prepend(li);
  });
  return ul;
};

const createFeeds = (i18nInstance, feeds) => {
  const feedsUl = makeFeedsUl(feeds);
  return fillContainer(i18nInstance.t('feeds'), feedsUl);
};

const createPosts = (i18nInstance, posts) => {
  const postsUl = makePostsUl(i18nInstance, posts);
  return fillContainer(i18nInstance.t('posts'), postsUl);
};

export { createFeeds, createPosts };
