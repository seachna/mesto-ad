// эта функция срабатывает при нажатии escape
const handleEscUp = (evt) => {
  if (evt.key === "Escape") {
    // находим попап который сейчас открыт
    const activePopup = document.querySelector(".popup_is-opened");
    closeModalWindow(activePopup);
  }
};

// открывает попап и добавляет обработчик escape
export const openModalWindow = (modalWindow) => {
  modalWindow.classList.add("popup_is-opened");
  document.addEventListener("keyup", handleEscUp);
};

// закрывает попап и убирает обработчик escape
export const closeModalWindow = (modalWindow) => {
  modalWindow.classList.remove("popup_is-opened");
  document.removeEventListener("keyup", handleEscUp);
};

// навешивает обработчики закрытия попапа по крестику и по клику на оверлей
export const setCloseModalWindowEventListeners = (modalWindow) => {
  const closeButtonElement = modalWindow.querySelector(".popup__close")

  // закрытие по кнопке крестика
  closeButtonElement.addEventListener("click", () => {
    closeModalWindow(modalWindow);
  });

  // закрытие по клику вне окна то есть по затемненному фону
  modalWindow.addEventListener("mousedown", (evt) => {
    if (evt.target.classList.contains("popup")) {
      closeModalWindow(modalWindow);
    }
  });
}