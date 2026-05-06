// эта функция просто меняет состояние кнопки лайка
export const likeCard = (likeButton) => {
  likeButton.classList.toggle("card__like-button_is-active");
};

// эта функция удаляет карточку со страницы
export const deleteCard = (cardElement) => {
  cardElement.remove();
};

// получаем шаблон карточки из html и клонируем его
const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

// создаем одну карточку и заполняем ее данными
export const createCardElement = (
  data,
  { onPreviewPicture, onLikeIcon, onDeleteCard, onInfoIcon },
  currentUserID
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const cardImage = cardElement.querySelector(".card__image");

  // находим элемент счетчика лайков и сразу ставим туда количество лайков с сервера
  const likeCountElement = cardElement.querySelector(".card__like-count");
  likeCountElement.textContent = data.likes.length;

  // находим кнопку информации для варианта 1
  const infoButton = cardElement.querySelector(".card__control-button_type_info");

  // подставляем картинку и название карточки
  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;

  // если карточка не моя то кнопку удаления убираем
  if (data.owner._id !== currentUserID) {
    deleteButton.remove();
  }

  // если передан обработчик лайка навешиваем его на кнопку лайка
  if (onLikeIcon) {
    likeButton.addEventListener("click", () => onLikeIcon(data._id, cardElement, likeButton));
  }

  // если карточка моя и есть обработчик удаления навешиваем его на корзину
  if (onDeleteCard && data.owner._id === currentUserID) {
    deleteButton.addEventListener("click", () => onDeleteCard(data._id, cardElement));
  }

  // если есть обработчик кнопки i навешиваем его
  if (onInfoIcon) {
    infoButton.addEventListener("click", () => onInfoIcon(data._id));
  }

  // если есть обработчик просмотра картинки навешиваем его на изображение
  if (onPreviewPicture) {
    cardImage.addEventListener("click", () => onPreviewPicture({ name: data.name, link: data.link }));
  }

  // возвращаем готовый dom элемент карточки
  return cardElement;
};