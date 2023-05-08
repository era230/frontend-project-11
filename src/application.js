/* eslint-disable no-param-reassign */
import i18next from 'i18next';
import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import uniqueId from 'lodash/uniqueId';
import render from './view';
import ru from './locales/ru';
import parse from './parser';

const makeSchema = (existedUrls) => {
  const schema = yup
    .string()
    .trim()
    .required('form.fail.requiredUrl')
    .url('form.fail.invalidUrl')
    .notOneOf(existedUrls, 'form.fail.doubleUrl');
  return schema;
};

const getProxyUrl = (url) => {
  const proxy = new URL('./get', 'https://allorigins.hexlet.app');
  proxy.searchParams.set('disableCache', 'true');
  proxy.searchParams.set('url', url);
  return proxy.toString();
};

const viewPost = (postsContainer, state) => {
  postsContainer.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    const postId = li.querySelector('a').dataset.id;
    state.uiState.currentPost = postId;
    state.uiState.viewedPosts = [postId, ...state.uiState.viewedPosts];
  });
};

const addRss = (elements, state) => {
  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    state.addRssProcess = 'adding';
    const formData = new FormData(e.target);
    const url = formData.get('url');
    const existedUrls = state.content.feeds.map((feed) => feed.id);
    return makeSchema(existedUrls)
      .validate(url)
      .then(() => {
        state.formValidationProcess = 'valid';
        return axios.get(getProxyUrl(url));
      })
      .then((response) => {
        e.target.reset();
        const { feed, posts } = parse(response.data.contents);
        feed.id = url;
        posts.forEach((item) => {
          const post = item;
          post.id = url;
          post.postId = uniqueId();
        });
        state.addRssProcess = 'successful';
        state.content.feeds = [feed, ...state.content.feeds];
        state.content.posts = [...posts, ...state.content.posts];
      })
      .catch((err) => {
        switch (err.name) {
          case 'ValidationError':
            state.formValidationProcess = 'invalid';
            state.formValidationError = err;
            break;

          case 'AxiosError':
          default:
            state.addRssProcess = 'failed';
            state.addRssError = err;
        }
      });
  });
};

const updateRss = (state) => {
  const existedUrls = state.content.feeds.map((feed) => feed.id);
  const promises = existedUrls.map((url) => axios.get(getProxyUrl(url))
    .then((response) => {
      const { posts } = parse(response.data.contents);
      const existedPosts = state.content.posts.filter((post) => post.id === url)
        .map((post) => post.link);
      const newPosts = posts.filter((post) => !existedPosts.includes(post.link));
      newPosts.forEach((item) => {
        const post = item;
        post.id = url;
        post.postId = uniqueId();
      });
      return newPosts;
    }));
  return Promise.all(promises)
    .then((newPosts) => {
      const updatedNewPosts = newPosts.flat();
      if (updatedNewPosts.length > 0) {
        state.content.posts = [...updatedNewPosts, ...state.content.posts];
      }
    })
    .catch((e) => {
      state.addRssProcess = 'failed';
      state.addRssError = e;
    })
    .finally(() => setTimeout(() => updateRss(state), 5000));
};

export default () => {
  const i18n = i18next.createInstance();
  i18n.init({
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
        formValidationProcess: 'valid',
        formValidationError: null,
        addRssProcess: 'initial',
        addRssError: null,
        content: {
          feeds: [],
          posts: [],
        },
        uiState: {
          currentPost: '',
          viewedPosts: [],
        },
      };

      const watchedState = onChange(state, (path, value) => {
        render(elements, state, path, value, i18n);
      });

      addRss(elements, watchedState);
      viewPost(elements.postsContainer, watchedState);
      updateRss(watchedState);
    });
};
