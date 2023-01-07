const handleProcessState = (elements, processState) => {
  switch (processState) {
    case 'filling':
      break;

    case 'sent': {
      const { input, feedbackContainer } = elements;
      input.classList.remove('is-invalid');
      feedbackContainer.classList.remove('text-danger');
      feedbackContainer.classList.add('text-success');
      feedbackContainer.textContent = 'RSS успешно загружен';
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

const render = (elements) => (path, value) => {
  switch (path) {
    case 'form.processState':
      handleProcessState(elements, value);
      break;

    case 'form.error':
      renderError(elements, value);
      break;

    default:
      break;
  }
};

export default render;
