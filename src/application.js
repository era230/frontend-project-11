import i18next from 'i18next';
import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import findIndex from 'lodash/findIndex';
import render from './view';
import ru from './locales/ru';
import getRssData from './parser';

const makeSchema = (i18nInstance, existedUrls) => {
  const schema = yup
    .string()
    .trim()
    .required(i18nInstance.t('form.fail.requiredUrl'))
    .url(i18nInstance.t('form.fail.invalidUrl'))
    .notOneOf(existedUrls, i18nInstance.t('form.fail.doubleUrl'));
  return schema;
};

const addRss = (elements, state) => {
  const { i18nInstance } = state;
  const watchedState = state;
  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    return makeSchema(i18nInstance, watchedState.form.existedUrls)
      .validate(url)
      .then(() => {
        e.target.reset();
        watchedState.form.existedUrls = [...watchedState.form.existedUrls, url];
        return axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`);
      })
      .then((response) => {
        watchedState.form.processState = 'sent';
        const { feed, posts } = getRssData(response.data.contents, url, i18nInstance);
        watchedState.content.feeds = [feed, ...state.content.feeds];
        watchedState.content.posts = [...posts, ...state.content.posts];
        watchedState.content.processState = 'added';
      })
      .catch((err) => {
        switch (err.name) {
          case 'ValidationError':
            watchedState.form.processState = 'error';
            watchedState.error = err;
            throw err;

          case 'AxiosError':
          default:
            watchedState.content.processState = 'error';
            watchedState.error = err;
        }
      });
  });
};

const updateRss = (state) => {
  const { i18nInstance } = state;
  const watchedState = state;
  const promises = watchedState.form.existedUrls.map((url) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
    .then((response) => {
      const { posts } = getRssData(response.data.contents, url, i18nInstance);
      const existedPosts = watchedState.content.posts.filter((post) => post.id === url);
      const { title } = existedPosts[0];
      const index = findIndex(posts, { title });
      const newPosts = posts.slice(0, index);
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
    })
    .then(() => setTimeout(() => updateRss(watchedState), 5000))
    .catch((e) => {
      watchedState.content.processState = 'error';
      watchedState.error = e;
      throw e;
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
  });

  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('input'),
    submitButton: document.querySelector('button'),
    feedbackContainer: document.querySelector('.feedback'),
    feedsContainer: document.querySelector('.col-md-10.feeds'),
    postsContainer: document.querySelector('.col-md-10.posts'),
  };

  const state = {
    form: {
      processState: 'initial',
      existedUrls: [],
    },
    content: {
      processState: 'initial',
      feeds: [],
      posts: [],
    },
    i18nInstance,
    error: {},
  };

  const watchedState = onChange(state, (path, value) => {
    render(elements, state, path, value);
  });

  addRss(elements, watchedState);
  updateRss(watchedState);
};
