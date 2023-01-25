import i18next from 'i18next';
import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import findIndex from 'lodash/findIndex';
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

const proxyUrl = (url) => {
  const proxy = new URL('./get', 'https://allorigins.hexlet.app');
  proxy.searchParams.set('disableCache', 'true');
  proxy.searchParams.set('url', url);
  return proxy.toString();
};

const addRss = (elements, state, i18nInstance) => {
  const watchedState = state;
  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    return makeSchema(watchedState.form.existedUrls, i18nInstance)
      .validate(url)
      .then(() => {
        watchedState.form.existedUrls = [...watchedState.form.existedUrls, url];
        watchedState.form.processState = 'sending';
        return axios.get(proxyUrl(url));
      })
      .then((response) => {
        watchedState.form.processState = 'sent';
        e.target.reset();
        const { feed, posts } = parse(response.data.contents, url, i18nInstance);
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
  const promises = watchedState.form.existedUrls.map((url) => axios.get(proxyUrl(url))
    .then((response) => {
      const { posts } = parse(response.data.contents, url, i18nInstance);
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
    .then(() => {
      watchedState.content.processState = 'initial';
      return setTimeout(() => updateRss(watchedState), 5000);
    })
    .catch((e) => {
      watchedState.content.processState = 'error';
      watchedState.content.error = e;
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
          existedUrls: [],
          error: {},
        },
        content: {
          processState: 'initial',
          feeds: [],
          posts: [],
          error: {},
        },
      };

      const watchedState = onChange(state, (path, value) => {
        render(elements, state, path, value, i18nInstance);
      });

      addRss(elements, watchedState, i18nInstance);
      updateRss(watchedState, i18nInstance);
      document.getElementById('output').innerHTML = i18next.t('key');
    });
};
