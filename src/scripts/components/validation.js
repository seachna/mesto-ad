// функция показывает текст ошибки под полем
const showInputError = (formElement, inputElement, errorMessage, settings) => {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  inputElement.classList.add(settings.inputErrorClass);
  errorElement.textContent = errorMessage;
  errorElement.classList.add(settings.errorClass);
};

// функция убирает текст ошибки и красную подсветку
const hideInputError = (formElement, inputElement, settings) => {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  inputElement.classList.remove(settings.inputErrorClass);
  errorElement.textContent = '';
  errorElement.classList.remove(settings.errorClass);
};

// функция проверяет одно конкретное поле формы
const checkInputValidity = (formElement, inputElement, settings) => {

  // если не прошло pattern показываем кастомное сообщение или стандартное
  if (inputElement.validity.patternMismatch) {
    const message = inputElement.dataset.errorMessage || inputElement.validationMessage;
    showInputError(formElement, inputElement, message, settings);
    return false;
  }
  
  // если поле вообще невалидно показываем стандартную ошибку браузера
  if (!inputElement.validity.valid) {
    showInputError(
      formElement, 
      inputElement, 
      inputElement.validationMessage, 
      settings
    );
    return false;
  } else {
    // если все нормально убираем ошибку
    hideInputError(formElement, inputElement, settings);
    return true;
  }
};

// проверяет есть ли в форме хотя бы одно невалидное поле
const hasInvalidInput = (inputList) => {
  return inputList.some(inputElement => {
    return !inputElement.validity.valid;
  });
};

// делает кнопку неактивной
const disableSubmitButton = (buttonElement, settings) => {
  buttonElement.classList.add(settings.inactiveButtonClass);
  buttonElement.disabled = true;
};

// делает кнопку активной
const enableSubmitButton = (buttonElement, settings) => {
  buttonElement.classList.remove(settings.inactiveButtonClass);
  buttonElement.disabled = false;
};

// включает или выключает кнопку в зависимости от валидности формы
const toggleButtonState = (inputList, buttonElement, settings) => {
  const hasErrors = hasInvalidInput(inputList);

  // отдельно проверяем что обязательные поля не пустые
  const allRequiredFilled = inputList.every(input => {
    if (input.required) {
      return input.value.trim() !== '';
    }
    return true;
  });
  
  if (!hasErrors && allRequiredFilled) {
    enableSubmitButton(buttonElement, settings);
  } else {
    disableSubmitButton(buttonElement, settings);
  }
};

// навешивает обработчики на все поля одной формы
const setEventListeners = (formElement, settings) => {
  const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
  const buttonElement = formElement.querySelector(settings.submitButtonSelector);
  
  // сразу при загрузке проверяем должна ли кнопка быть активной
  toggleButtonState(inputList, buttonElement, settings);

  inputList.forEach(inputElement => {
    inputElement.addEventListener('input', () => {
      checkInputValidity(formElement, inputElement, settings);
      toggleButtonState(inputList, buttonElement, settings);
    });
  });
};

// включает валидацию для всех форм на странице
export const enableValidation = (settings) => {
  const formList = Array.from(document.querySelectorAll(settings.formSelector));
  
  formList.forEach(formElement => {
    // отменяем стандартную отправку формы
    formElement.addEventListener('submit', (evt) => {
      evt.preventDefault();
    });

    setEventListeners(formElement, settings);
  });
};

// очищает старые ошибки и выключает кнопку формы
export const clearValidation = (formElement, settings) => {
  const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
  const buttonElement = formElement.querySelector(settings.submitButtonSelector);

  inputList.forEach(inputElement => {
    hideInputError(formElement, inputElement, settings);
  })
  
  disableSubmitButton(buttonElement, settings);
};