import { renderFeeds, renderPosts } from './render';

const handleFormProcessState = (elements, state, processState) => {
  const { input, feedbackContainer } = elements;
  const { i18nInstance } = state;
  switch (processState) {
    case 'initial':
      break;

    case 'sent': {
      input.classList.remove('is-invalid');
      feedbackContainer.classList.remove('text-danger');
      feedbackContainer.classList.add('text-success');
      feedbackContainer.textContent = i18nInstance.t('form.success');
      break;
    }

    case 'error':
      break;

    default:
      throw new Error(`Unknown process state: ${processState}`);
  }
};

const handleContentProcessState = (elements, state, processState) => {
  switch (processState) {
    case 'initial':
      break;

    case 'added':
      renderFeeds(elements.feedsContainer, state);
      renderPosts(elements.postsContainer, state);
      break;

    case 'updated':
      renderPosts(elements.postsContainer, state);
      break;

    case 'error':
      break;

    default:
      throw new Error(`Unknown process state: ${processState}`);
  }
};

const renderError = (elements, state, error) => {
  const { input, feedbackContainer } = elements;
  const { i18nInstance } = state;
  switch (error.name) {
    case 'ValidationError': {
      input.classList.add('is-invalid');
      feedbackContainer.classList.remove('text-success');
      feedbackContainer.classList.add('text-danger');
      feedbackContainer.textContent = error.message;
      break;
    }

    case 'AxiosError': {
      input.classList.remove('is-invalid');
      feedbackContainer.classList.remove('text-success');
      feedbackContainer.classList.add('text-danger');
      feedbackContainer.textContent = i18nInstance.t('content.fail.networkError');
      break;
    }

    default:
      input.classList.remove('is-invalid');
      feedbackContainer.classList.remove('text-success');
      feedbackContainer.classList.add('text-danger');
      if (error.message === i18nInstance.t('content.fail.invalidRss')) {
        feedbackContainer.textContent = i18nInstance.t('content.fail.invalidRss');
      } else {
        feedbackContainer.textContent = i18nInstance.t('content.fail.unknownError');
      }
      break;
  }
};

const render = (elements, state, path, value) => {
  switch (path) {
    case 'form.processState':
      handleFormProcessState(elements, state, value);
      break;

    case 'content.processState':
      handleContentProcessState(elements, state, value);
      break;

    case 'error':
      renderError(elements, state, value);
      break;

    default:
      break;
  }
};

export default render;
