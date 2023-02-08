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

const makeContainer = (containerTitle) => {
  const cardEl = makeEl('div', ['card', 'border-0']);
  const cardBody = makeEl('div', ['card-body']);
  const cardTitle = makeEl('h2', ['card-title']);
  cardTitle.textContent = containerTitle;
  cardBody.append(cardTitle);
  const ul = makeEl('ul', ['list-group', 'border-0', 'rounded-0']);
  cardEl.append(cardBody, ul);
  return cardEl;
};

const makeFeedsUl = (feeds) => feeds.map(({ title, description }) => {
  const li = makeEl('li', ['list-group-item', 'border-0', 'border-end-0']);
  const titleEl = makeEl('h3', ['h6', 'm-0']);
  titleEl.textContent = title;
  const descriptionEl = makeEl('p', ['m-0', 'small', 'text-black-50']);
  descriptionEl.textContent = description;
  li.append(titleEl, descriptionEl);
  return li;
});

const makePostsUl = (posts, i18nInstance) => posts.map((post) => {
  const {
    title, link, postId,
  } = post;
  const li = makeEl('li', ['list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0']);
  const linkEl = makeEl('a', ['fw-bold'], [{ name: 'target', value: '_blank' }, { name: 'rel', value: 'noopener' }, { name: 'rel', value: 'noreferrer' }]);
  linkEl.setAttribute('href', link);
  linkEl.setAttribute('data-id', postId);
  linkEl.textContent = title;
  const button = makeEl('button', ['btn', 'btn-outline-primary', 'btn-sm'], [{ name: 'type', value: 'button' }, { name: 'data-id', value: postId }, { name: 'data-bs-toggle', value: 'modal' }, { name: 'data-bs-target', value: '#modal' }]);
  button.textContent = i18nInstance.t('content.button');
  li.append(linkEl, button);
  return li;
});

const renderFeeds = (feedsContainer, state, i18nInstance) => {
  const { feeds } = state.content;
  let cardEl = feedsContainer.querySelector('.card.border-0');
  if (!cardEl) {
    cardEl = makeContainer(i18nInstance.t('content.feeds'));
    feedsContainer.append(cardEl);
  }
  const ul = feedsContainer.querySelector('ul');
  ul.innerHTML = '';
  const feedsUl = makeFeedsUl(feeds);
  feedsUl.forEach((li) => ul.append(li));
  return cardEl;
};

const renderPosts = (postsContainer, state, i18nInstance) => {
  const { posts } = state.content;
  let cardEl = postsContainer.querySelector('.card.border-0');
  if (!cardEl) {
    cardEl = makeContainer(i18nInstance.t('content.posts'));
    postsContainer.append(cardEl);
  }
  const ul = postsContainer.querySelector('ul');
  ul.innerHTML = '';
  const postsUl = makePostsUl(posts, i18nInstance);
  postsUl.forEach((li) => ul.append(li));
  return cardEl;
};

export { renderFeeds, renderPosts };
