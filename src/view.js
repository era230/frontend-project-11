import { renderFeeds, renderPosts } from './render';

const handleFormProcessState = (elements, processState, i18nInstance) => {
  const { input, submitButton, feedbackContainer } = elements;
  switch (processState) {
    case 'initial':
      break;

    case 'sending':
      submitButton.disabled = true;
      input.disable = true;
      break;

    case 'sent': {
      submitButton.disabled = false;
      input.disable = false;
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

const handleContentProcessState = (elements, state, processState, i18nInstance) => {
  switch (processState) {
    case 'initial':
      break;

    case 'added':
      renderFeeds(elements.feedsContainer, state, i18nInstance);
      renderPosts(elements.postsContainer, state, i18nInstance);
      break;

    case 'updated':
      renderPosts(elements.postsContainer, state, i18nInstance);
      break;

    case 'error':
      break;

    default:
      throw new Error(`Unknown process state: ${processState}`);
  }
};

const renderError = (elements, error, i18nInstance) => {
  const { input, feedbackContainer } = elements;
  switch (error.name) {
    case 'ValidationError': {
      input.classList.add('is-invalid');
      feedbackContainer.classList.remove('text-success');
      feedbackContainer.classList.add('text-danger');
      feedbackContainer.textContent = error.message;
      throw error;
    }

    case 'AxiosError': {
      input.classList.remove('is-invalid');
      feedbackContainer.classList.remove('text-success');
      feedbackContainer.classList.add('text-danger');
      feedbackContainer.textContent = i18nInstance.t('content.fail.networkError');
      throw error;
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
      throw error;
  }
};

const render = (elements, state, path, value, i18nInstance) => {
  switch (path) {
    case 'form.processState':
      handleFormProcessState(elements, value, i18nInstance);
      break;

    case 'content.processState':
      handleContentProcessState(elements, state, value, i18nInstance);
      break;

    case 'form.error':
    case 'content.error':
      renderError(elements, value, i18nInstance);
      break;

    default:
      break;
  }
};

export default render;
