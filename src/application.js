import i18next from 'i18next';
import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import uniqueId from 'lodash/uniqueId';
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

const addRss = (elements, watchedState, i18nInstance) => {
  const state = watchedState;
  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    const currentUrl = { url, id: uniqueId() };
    const urls = state.form.existedUrls.map((item) => item.url);
    return makeSchema(i18nInstance, urls)
      .validate(url)
      .then(() => {
        e.target.reset();
        state.form.existedUrls = [...state.form.existedUrls, currentUrl];
        return axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`);
      })
      .then((response) => {
        state.form.processState = 'sent';
        const { feed, posts } = getRssData(i18nInstance, response.data.contents, currentUrl.id);
        state.content.feeds = [feed, ...state.content.feeds];
        state.content.posts = [...posts, ...state.content.posts];
      })
      .catch((err) => {
        switch (err.name) {
          case 'ValidationError':
            state.form.processState = 'error';
            state.form.error = err;
            throw err;

          case 'AxiosError':
          default:
            state.content.error = err;
            throw err;
        }
      });
  });
};

const updateRss = (watchedState, i18nInstance) => {
  const state = watchedState;
  const promises = state.form.existedUrls.map((url) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url.url)}`)
    .then((response) => {
      const { posts } = getRssData(i18nInstance, response.data.contents, url.id);
      const existedPosts = state.content.posts.filter((post) => post.id === url.id);
      const { title } = existedPosts[0];
      const index = findIndex(posts, { title });
      const newPosts = posts.slice(0, index);
      return newPosts;
    }));
  return Promise.all(promises).then((newPosts) => {
    const updatedNewPosts = newPosts.flat();
    if (updatedNewPosts.length > 0) {
      state.content.posts = [...updatedNewPosts, ...state.content.posts];
    }
  })
    .then(() => setTimeout(() => updateRss(watchedState, i18nInstance), 5000))
    .catch((e) => {
      state.content.error = e;
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

  const state = onChange({
    form: {
      processState: 'initial',
      error: {},
      existedUrls: [],
    },
    content: {
      feeds: [],
      posts: [],
      uiState: [],
      error: {},
    },
  }, render(elements, i18nInstance));

  addRss(elements, state, i18nInstance);
  updateRss(state, i18nInstance);
};
