import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import render from './render';

export default () => {
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

  const schema = yup.string().url().notOneOf([state.form.urls]);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const { value } = e.target;
    state.form.field.url = value;
    schema.validate(state.form.field.url)
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
