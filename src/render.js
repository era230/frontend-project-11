import { createFeeds, createPosts } from './utils';

const handleProcessState = (elements, processState, i18nInstance) => {
  const { input, feedbackContainer } = elements;

  switch (processState) {
    case 'initial':
      break;

    case 'sent': {
      input.classList.remove('is-invalid');
      feedbackContainer.classList.remove('text-danger');
      feedbackContainer.classList.add('text-success');
      feedbackContainer.textContent = i18nInstance.t('feedback.success');
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
      feedbackContainer.textContent = i18nInstance.t('feedback.fail.networkError');
      break;
    }

    default:
      throw new Error(`Unknown error: ${error.message}`);
  }
};

const renderPosts = (postsContainer, posts, i18nInstance) => {
  postsContainer.append(createPosts(i18nInstance, posts));
};

const renderFeeds = (feedsContainer, feed, i18nInstance) => {
  feedsContainer.append(createFeeds(i18nInstance, feed));
};

const render = (elements, i18nInstance) => (path, value) => {
  switch (path) {
    case 'form.processState':
      handleProcessState(elements, value, i18nInstance);
      break;

    case 'error':
      renderError(elements, value, i18nInstance);
      break;

    case 'posts':
      renderPosts(elements.postsContainer, value, i18nInstance);
      break;

    case 'feeds':
      renderFeeds(elements.feedsContainer, value, i18nInstance);
      break;

    default:
      break;
  }
};

export default render;
