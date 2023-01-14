import i18next from 'i18next';
import * as yup from 'yup';
import { setLocale } from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import uniqueId from 'lodash/uniqueId';
import render from './render';
import ru from './locales/ru';
import parse from './parser';

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
    },
    error: null,
    feeds: [],
    posts: [],
  }, render(elements, i18nInstance));

  setLocale({
    string: {
      url: i18nInstance.t('feedback.fail.invalidUrl'),
      notOneOf: i18nInstance.t('feedback.fail.doubleUrl'),
    },
  });

  const existedUrls = [];

  const schema = yup.string().trim().required(i18nInstance.t('feedback.fail.requiredUrl')).url()
    .notOneOf(existedUrls);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    schema.validate(url)
      .then((v) => {
        e.target.reset();
        existedUrls.push(v);
      })
      .then(() => axios.get(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(url)}`))
      .then((response) => {
        const { feed, posts } = parse(response.data.contents);
        feed.id = uniqueId();
        posts.forEach((item) => {
          const post = item;
          post.feedId = feed.id;
        });
        state.form.processState = 'sent';
        state.feeds = [...state.feeds, feed];
        state.posts = [...state.posts, ...posts];
      })
      .catch((err) => {
        state.error = err;
        state.form.processState = 'error';
        throw err;
      });
  });
};
