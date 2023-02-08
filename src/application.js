import i18next from 'i18next';
import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import findIndex from 'lodash/findIndex';
import uniqueId from 'lodash/uniqueId';
import render from './view';
import ru from './locales/ru';
import parse from './parser';

const makeSchema = (existedUrls, i18nInstance) => {
  const schema = yup
    .string()
    .trim()
    .required(i18nInstance.t('form.fail.requiredUrl'))
    .url(i18nInstance.t('form.fail.invalidUrl'))
    .notOneOf(existedUrls, i18nInstance.t('form.fail.doubleUrl'));
  return schema;
};

const getProxyUrl = (url) => {
  const proxy = new URL('./get', 'https://allorigins.hexlet.app');
  proxy.searchParams.set('disableCache', 'true');
  proxy.searchParams.set('url', url);
  return proxy.toString();
};

const handleClick = (postsContainer, state) => {
  const watchedState = state;
  postsContainer.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    const postId = li.querySelector('a').dataset.id;
    watchedState.uiState.currentPost = postId;
  });
};

const addRss = (elements, state, i18nInstance) => {
  const watchedState = state;
  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    const existedUrls = watchedState.content.feeds.map((feed) => feed.id);
    return makeSchema(existedUrls, i18nInstance)
      .validate(url)
      .then(() => {
        watchedState.form.processState = 'sending';
        return axios.get(getProxyUrl(url));
      })
      .then((response) => {
        watchedState.form.processState = 'sent';
        e.target.reset();
        const { feed, posts } = parse(response.data.contents, i18nInstance);
        feed.id = url;
        posts.forEach((item) => {
          const post = item;
          post.id = url;
          post.postId = uniqueId();
        });
        watchedState.content.feeds = [feed, ...state.content.feeds];
        watchedState.content.posts = [...posts, ...state.content.posts];
        watchedState.content.processState = 'added';
      })
      .catch((err) => {
        switch (err.name) {
          case 'ValidationError':
            watchedState.form.processState = 'error';
            watchedState.form.error = err;
            break;

          case 'AxiosError':
          default:
            watchedState.content.processState = 'error';
            watchedState.content.error = err;
        }
      });
  });
};

const updateRss = (state, i18nInstance) => {
  const watchedState = state;
  const existedUrls = watchedState.content.feeds.map((feed) => feed.id);
  const promises = existedUrls.map((url) => axios.get(getProxyUrl(url))
    .then((response) => {
      const { posts } = parse(response.data.contents, i18nInstance);
      posts.forEach((item) => {
        const post = item;
        post.id = url;
        post.postId = uniqueId();
      });
      const existedPosts = watchedState.content.posts.filter((post) => post.id === url);
      let newPosts;
      if (existedPosts.length === 0) {
        newPosts = [];
      } else {
        const { title } = existedPosts[0];
        const index = findIndex(posts, { title });
        newPosts = posts.slice(0, index);
      }
      return newPosts;
    }));
  return Promise.all(promises).then((newPosts) => {
    const updatedNewPosts = newPosts.flat();
    if (updatedNewPosts.length > 0) {
      watchedState.content.posts = [...updatedNewPosts, ...watchedState.content.posts];
      watchedState.content.processState = 'updated';
    }
  })
    .catch((e) => {
      watchedState.content.processState = 'error';
      watchedState.content.error = e;
    })
    .finally(() => {
      watchedState.content.processState = 'initial';
      return setTimeout(() => updateRss(watchedState), 5000);
    });
};

export default () => {
  const i18nInstance = i18next.createInstance();
  i18nInstance.init({
    lng: 'ru',
    debug: false,
    resources: {
      ru,
    },
  })
    .then(() => {
      const elements = {
        form: document.querySelector('form'),
        input: document.querySelector('input'),
        submitButton: document.querySelector('button[type="submit"]'),
        feedbackContainer: document.querySelector('.feedback'),
        feedsContainer: document.querySelector('.col-md-10.feeds'),
        postsContainer: document.querySelector('.col-md-10.posts'),
      };

      const state = {
        form: {
          processState: 'initial',
          error: null,
        },
        content: {
          processState: 'initial',
          feeds: [],
          posts: [],
          error: null,
        },
        uiState: {
          currentPost: '',
        },
      };

      const watchedState = onChange(state, (path, value) => {
        render(elements, state, path, value, i18nInstance);
      });

      addRss(elements, watchedState, i18nInstance);
      handleClick(elements.postsContainer, watchedState);
      updateRss(watchedState, i18nInstance);
    });
};
