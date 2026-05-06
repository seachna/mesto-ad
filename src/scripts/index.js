import { createCardElement, deleteCard, likeCard } from "./components/card.js";
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
const removeCardForm = removeCardModalWindow ? removeCardModalWindow.querySelector(".popup__form") : null;

// Настройки валидации
const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  
  const submitButton = profileForm.querySelector('.popup__button');
  const originalText = submitButton.textContent;
  submitButton.textContent = 'Сохранение...';
  
  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
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

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();
  
  const submitButton = avatarForm.querySelector('.popup__button');
  const originalText = submitButton.textContent;
  submitButton.textContent = 'Сохранение...';
  
  setUserAvatar(avatarInput.value)
    .then((userData) => {
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

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  
  const submitButton = cardForm.querySelector('.popup__button');
  const originalText = submitButton.textContent;
  submitButton.textContent = 'Создание...';
  
  addNewCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((cardData) => {
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
      clearValidation(cardForm, validationSettings);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      submitButton.textContent = originalText;
    });
};

// EventListeners
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  openModalWindow(profileFormModalWindow);
  clearValidation(profileForm, validationSettings);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  openModalWindow(avatarFormModalWindow);
  clearValidation(avatarForm, validationSettings);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  openModalWindow(cardFormModalWindow);
  clearValidation(cardForm, validationSettings);
});

//настраиваем обработчики закрытия поп
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

// Включаем валидацию всех  форм
enableValidation(validationSettings);

let userID = null;

Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
    
    userID = userData._id;
    
    cards.forEach((data) => {
      placesWrap.append(
        createCardElement(
          data,
          {
            onPreviewPicture: handlePreviewPicture,
            onLikeIcon: handleLikeClick,
            onDeleteCard: handleDeleteCard,
            onInfoIcon: handleInfoClick
          },
          userID
        )
      );
    });
  })
  .catch((err) => {
    console.log(err);
  });

  const handleDeleteCard = (cardID, cardElement) => {
  deleteCardApi(cardID)
    .then(() => {
      cardElement.remove();
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleLikeClick = (cardID, cardElement, likeButton) => {
  const isLiked = likeButton.classList.contains("card__like-button_is-active");
  
  changeLikeCardStatus(cardID, isLiked)
    .then((cardData) => {
      likeButton.classList.toggle("card__like-button_is-active");
      cardElement.querySelector(".card__like-count").textContent = cardData.likes.length;
    })
    .catch((err) => {
      console.log(err);
    });
};

const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const createInfoString = (term, description) => {
  const template = document.getElementById("popup-info-definition-template");
  const infoItem = template.content.cloneNode(true);
  infoItem.querySelector(".popup__info-term").textContent = term;
  infoItem.querySelector(".popup__info-description").textContent = description;
  return infoItem;
};

const createUserPreview = (userData) => {
  const template = document.getElementById("popup-info-user-preview-template");
  const listItem = template.content.cloneNode(true);
  const badge = listItem.querySelector(".popup__list-item_type_badge");
  
  if (userData.avatar) {
    badge.style.backgroundImage = `url(${userData.avatar})`;
  }
  badge.title = userData.name;
  
  return listItem;
};

const handleInfoClick = (cardId) => {
  getCardList()
    .then((cards) => {
      const cardData = cards.find(card => card._id === cardId);
      if (!cardData) return;
      
      cardInfoModalTitle.textContent = "";
      cardInfoModalInfoList.innerHTML = "";
      cardInfoModalText.textContent = "";
      cardInfoModalList.innerHTML = "";
      
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
      
      if (cardData.likes.length > 0) {
        cardData.likes.forEach(user => {
          const template = document.getElementById("popup-info-user-preview-template");
          const listItem = template.content.cloneNode(true);
          const badge = listItem.querySelector(".popup__list-item_type_badge");
          
          badge.textContent = user.name || 'Аноним';
          
          cardInfoModalList.appendChild(listItem);
        });
      }
      
      openModalWindow(cardInfoModalWindow);
    })
    .catch((err) => {
      console.log(err);
    });
};

allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});