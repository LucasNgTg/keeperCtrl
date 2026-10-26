const cover = document.getElementById("game-cover-image");
const banner = document.getElementById("game-overview");
const title = document.getElementById("game-title");
const platforms = document.getElementById("game-platforms");
const release = document.getElementById("release-year");
const studio = document.getElementById("studio");
const desc = document.getElementById("game-description");
const modalTitle = document.getElementById("modal__game-title");
const modalCover = document.getElementById("modal__game-image");
const modalStudio = document.getElementById("modal__game-studio");

const gameData = "src/data/games.json";

const params = new URLSearchParams(window.location.search);
const gameId = params.get("id");

getData(gameId);


async function getData(game) {
  try {
    const response = await fetch(gameData);

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const gameInfo = await response.json();
    loadPage(gameInfo, game);
  } catch (e) {
    console.log(e.message);
  }
}

function loadPage(gameInfo, gameId) {
  const game = gameInfo.find((item) => item.id === gameId);

  if (!game) {
    console.error("Jogo não encontrado.");
    return;
  }

  document.title = `${game.name} | keeperCtrl`;

  title.textContent = game.name;
  modalTitle.textContent = game.name;

  cover.src = game.img.cover;
  modalCover.src = game.img.cover;

  banner.style.backgroundImage = `url("${game.img.banner}")`;

  desc.textContent = game.desc;

  release.textContent = game.release;

  studio.textContent = game.studio;
  modalStudio.textContent = game.studio;

  platforms.replaceChildren();

  game.platforms.forEach((platform) => {
    const item = document.createElement("li");

    item.textContent = platform.toUpperCase();

    platforms.appendChild(item);
  });
}
