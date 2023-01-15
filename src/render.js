import { renderFeeds, renderPosts } from './utils';

const handleProcessState = (elements, processState, i18nInstance) => {
  const { input, feedbackContainer } = elements;

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

const renderError = (elements, error, i18nInstance) => {
  const { input, feedbackContainer } = elements;
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

const render = (elements, i18nInstance) => (path, value) => {
  switch (path) {
    case 'form.processState':
      handleProcessState(elements, value, i18nInstance);
      break;

    case 'form.formError':
    case 'content.error':
      renderError(elements, value, i18nInstance);
      break;

    case 'content.posts':
      renderPosts(elements.postsContainer, value, i18nInstance);
      break;

    case 'content.feeds':
      renderFeeds(elements.feedsContainer, value, i18nInstance);
      break;

    default:
      break;
  }
};

export default render;
