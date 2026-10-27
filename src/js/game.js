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
const statsList = document.getElementById("stats");

const totalScore = document.getElementById("total-score");
const numRatings = document.getElementById("num-ratings");
const numComments = document.getElementById("num-comments");

const gameData = "src/data/games.json";

const params = new URLSearchParams(window.location.search);
const gameId = params.get("id");

getData(gameId);
loadStats(gameId);

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

function loadStats(game) {
  const gameStats = JSON.parse(localStorage.getItem(game));
  let total = 0;
  let ratedCat = 0;

  if (!gameStats) {
    return;
  }

  for (const [key, criteria] of Object.entries(gameStats.criteria)) {
    let rated = 0;
    let catSum = 0;

    for (const [criterion, stats] of Object.entries(criteria)) {
      const element = document.querySelector(`#stat-${key}__${criterion} .stat-average`);

      if (stats.count > 0) {
        const statAverage = stats.sum / stats.count;

        statsList.style.setProperty(`--scr-${key}__${criterion}`, statAverage);
        element.textContent = statAverage;

        catSum += statAverage;
        rated++;
      }
    }

    const catElement = document.querySelector(`#stat-${key} .stat-average`);

    if (rated > 0) {
      statsList.style.setProperty(`--scr-${key}`, catSum / rated);
      catElement.textContent = (catSum / rated).toFixed(1);
      total += catSum / rated;
      ratedCat++;
    }
  }

  if (ratedCat > 0) {
    totalScore.textContent = (total / ratedCat).toFixed(1);
  }

  numRatings.textContent = shortenNum(gameStats.numRatings);

  numComments.textContent = shortenNum(gameStats.numComments);
}
