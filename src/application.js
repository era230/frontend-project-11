import i18next from 'i18next';
import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import uniqueId from 'lodash/uniqueId';
import render from './render';
import ru from './locales/ru';
import parse from './parser';

const makeSchema = (i18nInstance, existedUrls) => {
  const schema = yup
    .string()
    .trim()
    .required(i18nInstance.t('form.fail.requiredUrl'))
    .url(i18nInstance.t('form.fail.invalidUrl'))
    .notOneOf(existedUrls, i18nInstance.t('form.fail.doubleUrl'));
  return schema;
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
      formState: 'initial',
      formError: {},
      existedUrls: [],
    },
    content: {
      feeds: [],
      posts: [],
      error: {},
    },
  }, render(elements, i18nInstance));

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    const schema = makeSchema(i18nInstance, state.form.existedUrls);
    schema.validate(url)
      .then((v) => {
        e.target.reset();
        state.form.existedUrls = [...state.form.existedUrls, v];
      })
      .then(() => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`))
      .then((response) => {
        state.form.processState = 'sent';
        const { feed, posts } = parse(i18nInstance, response.data.contents);
        feed.id = uniqueId();
        posts.forEach((item) => {
          const post = item;
          post.feedId = feed.id;
        });
        state.content.feeds = [...state.content.feeds, feed];
        state.content.posts = [...state.content.posts, ...posts];
      })
      .catch((err) => {
        switch (err.name) {
          case 'ValidationError':
            state.form.processState = 'error';
            state.form.formError = err;
            throw err;

          case 'AxiosError':
            state.content.error = err;
            throw err;

          default:
            state.content.error = err;
            throw err;
        }
      });
  });
};
