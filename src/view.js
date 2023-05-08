import { renderFeeds, renderPosts } from './render';

const handleFormValidationProcess = (elements, validationState) => {
  const { input, submitButton } = elements;
  switch (validationState) {
    case 'valid':
      break;

    case 'invalid':
      submitButton.disabled = false;
      input.readOnly = false;
      break;

    default:
      throw new Error(`Unknown validation state: ${validationState}`);
  }
};

const handleAddRssProcess = (elements, processState, i18n) => {
  const { input, submitButton, feedbackContainer } = elements;
  switch (processState) {
    case 'initial':
      break;

    case 'adding':
      submitButton.disabled = true;
      input.readOnly = true;
      break;

    case 'successful':
      submitButton.disabled = false;
      input.readOnly = false;
      feedbackContainer.classList.remove('text-danger');
      feedbackContainer.classList.add('text-success');
      feedbackContainer.textContent = i18n.t('form.success');
      break;

    case 'failed':
      submitButton.disabled = false;
      input.readOnly = false;
      break;

    default:
      throw new Error(`Unknown process state: ${processState}`);
  }
};

const renderError = (elements, error, i18n) => {
  const { input, feedbackContainer } = elements;
  input.classList.add('is-invalid');
  feedbackContainer.classList.remove('text-success');
  feedbackContainer.classList.add('text-danger');
  switch (error.name) {
    case 'ValidationError': {
      feedbackContainer.textContent = i18n.t(error.message);
      break;
    }

    case 'AxiosError': {
      feedbackContainer.textContent = i18n.t('content.fail.networkError');
      break;
    }

    default:
      if (error.message === 'content.fail.invalidRss') {
        feedbackContainer.textContent = i18n.t('content.fail.invalidRss');
      } else {
        feedbackContainer.textContent = i18n.t('content.fail.unknownError');
        console.log(error);
      }
      break;
  }
};

const renderLinks = (postsContainer, state, id) => {
  const link = postsContainer.querySelector(`a[data-id="${id}"]`);
  link.classList.remove('fw-bold');
  link.classList.add('fw-normal', 'link-secondary');
  const { title, description } = state.content.posts.find((item) => item.postId === id);
  const modalTitle = document.querySelector('.modal-title');
  const modalBody = document.querySelector('.modal-body');
  const modalLink = document.querySelector('.btn-primary.full-article');
  modalLink.setAttribute('href', link);
  modalTitle.textContent = title;
  modalBody.textContent = description;
};

const render = (elements, state, path, value, i18n) => {
  switch (path) {
    case 'formValidationProcess':
      handleFormValidationProcess(elements, value);
      break;

    case 'addRssProcess':
      handleAddRssProcess(elements, value, i18n);
      break;

    case 'content.posts':
      renderPosts(elements.postsContainer, state, value, i18n);
      break;

    case 'content.feeds':
      renderFeeds(elements.feedsContainer, value, i18n);
      break;

    case 'addRssError':
    case 'formValidationError':
      renderError(elements, value, i18n);
      break;

    case 'uiState.currentPost':
      renderLinks(elements.postsContainer, state, value);
      break;

    default:
      break;
  }
};

export default render;
