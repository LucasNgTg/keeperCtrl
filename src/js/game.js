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

getData("test");

async function getData(game) {
  try {
    const response = await fetch(gameData);
    const gameInfo = await response.json();
    loadPage(gameInfo, game);
  } catch (e) {
    console.log(e.message);
  }
}

function loadPage(gameInfo, gameId) {
  const game = gameInfo.find(item => item.id === gameId);

  if (!game) {
    console.error("Jogo não encontrado.");
    return;
  }

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

  game.platforms.forEach(platform => {
    const item = document.createElement("li");

    item.textContent = platform.toUpperCase();

    platforms.appendChild(item);
  });
}
