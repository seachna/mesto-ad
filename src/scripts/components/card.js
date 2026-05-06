export const likeCard = (likeButton) => {
  likeButton.classList.toggle("card__like-button_is-active");
};

export const deleteCard = (cardElement) => {
  cardElement.remove();
};

const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (
  data,
  { onPreviewPicture, onLikeIcon, onDeleteCard, onInfoIcon },
  currentUserID
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const cardImage = cardElement.querySelector(".card__image");

  const likeCountElement = cardElement.querySelector(".card__like-count");
  likeCountElement.textContent = data.likes.length;

  const infoButton = cardElement.querySelector(".card__control-button_type_info");

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;

  if (data.owner._id !== currentUserID) {
    deleteButton.remove();
  }

  if (onLikeIcon) {
    likeButton.addEventListener("click", () => onLikeIcon(data._id, cardElement, likeButton));
  }

  if (onDeleteCard && data.owner._id === currentUserID) {
    deleteButton.addEventListener("click", () => onDeleteCard(data._id, cardElement));
  }

   if (onInfoIcon) {
    infoButton.addEventListener("click", () => onInfoIcon(data._id));
  }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () => onPreviewPicture({name: data.name, link: data.link}));
  }

  return cardElement;
};