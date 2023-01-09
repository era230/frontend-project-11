import './styles.scss';
import 'bootstrap';
import i18next from 'i18next';
import * as yup from 'yup';
import { setLocale } from 'yup';
import onChange from 'on-change';
import render from './render';
import ru from './locales/ru';

export default () => {
  const i18nInstance = i18next.createInstance();
  i18nInstance.init({
    lng: 'ru',
    debug: false,
    resources: ru,
  });

  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('input'),
    submitButton: document.querySelector('button'),
    feedbackContainer: document.querySelector('.feedback'),
  };

  const state = onChange({
    form: {
      processState: 'filling',
      error: {},
      field: {
        url: '',
      },
      urls: [],
    },
    posts: {},
  }, render(elements));

  setLocale({
    string: {
      url: i18nInstance.t('feedback.fail.invalidUrl'),
      notOneOf: i18nInstance.t('feedback.fail.doubleUrl'),
    },
  });

  const schema = yup.object().shape({
    url: yup.string().url().notOneOf([state.form.urls]),
  });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const { value } = e.target;
    state.form.field.url = value;
    schema.validate({ url: state.form.field.url })
      .then((v) => {
        e.target.reset();
        state.form.urls = [...state.form.urls, v];
        state.form.processState = 'sent';
      })
      .catch((err) => {
        state.form.error = err;
        state.form.processState = 'error';
        throw err;
      });
  });
};
