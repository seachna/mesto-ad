import { createCardElement, deleteCard, renderLikes } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";
import {
  getUserInfo,
  getCardList,
  setUserInfo,
  setUserAvatar,
  addNewCard,
  deleteCardApi,
  changeLikeCardStatus
} from "./components/api.js";

const placesWrap = document.querySelector(".places__list");

const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const cardInfoModalWindow = document.querySelector(".popup_type_info");
const cardInfoModalTitle = cardInfoModalWindow.querySelector(".popup__title");
const cardInfoModalInfoList = cardInfoModalWindow.querySelector(".popup__info");
const cardInfoModalText = cardInfoModalWindow.querySelector(".popup__text");
const cardInfoModalList = cardInfoModalWindow.querySelector(".popup__list");

const removeCardModalWindow = document.querySelector(".popup_type_remove-card");
const removeCardForm = removeCardModalWindow.querySelector(".popup__form");
const removeCardSubmitButton = removeCardForm.querySelector(".popup__button");

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

let userID = null;

let cardToDeleteId = null;
let cardToDeleteElement = null;

// открытие попапа с большой картинкой
const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

// отправка формы редактирования профиля
const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();

  // меняем текст кнопки пока идет запрос
  const submitButton = profileForm.querySelector(".popup__button");
  const originalText = submitButton.textContent;
  submitButton.textContent = "Сохранение...";

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      // после успешного ответа обновляем профиль на странице
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      submitButton.textContent = originalText;
    });
};

// отправка формы обновления аватара
const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();

  const submitButton = avatarForm.querySelector(".popup__button");
  const originalText = submitButton.textContent;
  submitButton.textContent = "Сохранение...";

  setUserAvatar(avatarInput.value)
    .then((userData) => {
      // после ответа сервера меняем аватар на странице
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      submitButton.textContent = originalText;
    });
};

// отправка формы добавления новой карточки
const handleCardFormSubmit = (evt) => {
  evt.preventDefault();

  const submitButton = cardForm.querySelector(".popup__button");
  const originalText = submitButton.textContent;
  submitButton.textContent = "Создание...";

  addNewCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((cardData) => {
      // после успешного ответа добавляем новую карточку в начало списка
      placesWrap.prepend(
        createCardElement(
          cardData,
          {
            onPreviewPicture: handlePreviewPicture,
            onLikeIcon: handleLikeClick,
            onDeleteCard: handleDeleteCard,
            onInfoIcon: handleInfoClick,
          },
          userID
        )
      );
      closeModalWindow(cardFormModalWindow);
      cardForm.reset();
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      submitButton.textContent = originalText;
    });
};

// по клику на корзину не удаляем сразу а открываем попап подтверждения
const handleDeleteCard = (cardID, cardElement) => {
  cardToDeleteId = cardID;
  cardToDeleteElement = cardElement;
  openModalWindow(removeCardModalWindow);
};

// удаление карточки после подтверждения в попапе
const handleRemoveCardSubmit = (evt) => {
  evt.preventDefault();

  if (!cardToDeleteId || !cardToDeleteElement) {
    return;
  }

  const originalText = removeCardSubmitButton.textContent;
  removeCardSubmitButton.textContent = "Удаление...";

  deleteCardApi(cardToDeleteId)
    .then(() => {
      // после успешного ответа удаляем карточку со страницы и закрываем попап
      deleteCard(cardToDeleteElement);
      closeModalWindow(removeCardModalWindow);
      cardToDeleteId = null;
      cardToDeleteElement = null;
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      removeCardSubmitButton.textContent = originalText;
    });
};

// постановка или снятие лайка и обновление счетчика
const handleLikeClick = (cardID, cardElement, likeButton) => {
  const isLiked = likeButton.classList.contains("card__like-button_is-active");

  changeLikeCardStatus(cardID, isLiked)
    .then((cardData) => {
      renderLikes(cardElement, cardData.likes, userID);
    })
    .catch((err) => {
      console.log(err);
    });
};

// форматирование даты для попапа информации
const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

// создание одной строки с подписью и значением
const createInfoString = (term, description) => {
  const template = document.getElementById("popup-info-definition-template");
  const infoItem = template.content.cloneNode(true);
  infoItem.querySelector(".popup__info-term").textContent = term;
  infoItem.querySelector(".popup__info-description").textContent = description;
  return infoItem;
};

// обработчик клика по кнопке i для варианта 1
const handleInfoClick = (cardId) => {
  // берем актуальные данные карточек с сервера как и требует задание
  getCardList()
    .then((cards) => {
      const cardData = cards.find((card) => card._id === cardId);
      if (!cardData) return;

      // сначала очищаем попап от старых данных
      cardInfoModalTitle.textContent = "";
      cardInfoModalInfoList.innerHTML = "";
      cardInfoModalText.textContent = "";
      cardInfoModalList.innerHTML = "";

      // заполняем заголовок и основную информацию
      cardInfoModalTitle.textContent = "Информация о карточке";

      cardInfoModalInfoList.append(
        createInfoString("Описание:", cardData.name)
      );

      cardInfoModalInfoList.append(
        createInfoString(
          "Дата создания:",
          formatDate(new Date(cardData.createdAt))
        )
      );

      cardInfoModalInfoList.append(
        createInfoString("Владелец:", cardData.owner.name)
      );

      cardInfoModalInfoList.append(
        createInfoString("Количество лайков:", cardData.likes.length.toString())
      );

      cardInfoModalText.textContent = "Лайкнули:";

      // если лайки есть выводим список пользователей
      if (cardData.likes.length > 0) {
        cardData.likes.forEach((user) => {
          const template = document.getElementById("popup-info-user-preview-template");
          const listItem = template.content.cloneNode(true);
          const badge = listItem.querySelector(".popup__list-item_type_badge");

          badge.textContent = user.name || "Аноним";

          cardInfoModalList.appendChild(listItem);
        });
      }

      openModalWindow(cardInfoModalWindow);
    })
    .catch((err) => {
      console.log(err);
    });
};

// обработчики отправки форм
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);
removeCardForm.addEventListener("submit", handleRemoveCardSubmit);

// открытие попапа профиля с подстановкой текущих данных
openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  openModalWindow(profileFormModalWindow);
  clearValidation(profileForm, validationSettings);
});

// открытие попапа аватара с пустым полем
profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  openModalWindow(avatarFormModalWindow);
  clearValidation(avatarForm, validationSettings);
});

// открытие попапа новой карточки с очисткой формы
openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  openModalWindow(cardFormModalWindow);
  clearValidation(cardForm, validationSettings);
});

// навешиваем обработчики закрытия на все попапы
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

// включаем валидацию всех форм один раз
enableValidation(validationSettings);

// одновременно получаем карточки и данные пользователя с сервера
Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    // заполняем профиль данными с сервера
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    userID = userData._id;

    // отрисовываем карточки на странице
    cards.forEach((data) => {
      placesWrap.append(
        createCardElement(
          data,
          {
            onPreviewPicture: handlePreviewPicture,
            onLikeIcon: handleLikeClick,
            onDeleteCard: handleDeleteCard,
            onInfoIcon: handleInfoClick,
          },
          userID
        )
      );
    });
  })
  .catch((err) => {
    console.log(err);
  });