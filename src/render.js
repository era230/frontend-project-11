const handleProcessState = (elements, processState, i18nInstance) => {
  switch (processState) {
    case 'filling':
      break;

    case 'sent': {
      const { input, feedbackContainer } = elements;
      input.classList.remove('is-invalid');
      feedbackContainer.classList.remove('text-danger');
      feedbackContainer.classList.add('text-success');
      feedbackContainer.textContent = i18nInstance.t('feedback.succeed');
      break;
    }

    case 'error':
      break;

    default:
      throw new Error(`Unknown process state: ${processState}`);
  }
};

const renderError = (elements, value) => {
  const { input, feedbackContainer } = elements;
  input.classList.add('is-invalid');
  feedbackContainer.textContent = value;
};

const render = (elements, i18nInstance) => (path, value) => {
  switch (path) {
    case 'form.processState':
      handleProcessState(elements, value, i18nInstance);
      break;

    case 'form.error':
      renderError(elements, value, i18nInstance);
      break;

    default:
      break;
  }
};

export default render;
