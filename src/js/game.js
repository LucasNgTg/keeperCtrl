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
const posts = document.getElementById("posts");

const gameData = "src/data/games.json";

const params = new URLSearchParams(window.location.search);
const gameId = params.get("id");
const gameItem = JSON.parse(localStorage.getItem(gameId));

getData(gameId);
if (gameItem) {
  loadStats(gameItem);
  loadComments(gameItem);
}

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

function loadStats(gameItem) {
  let total = 0;
  let ratedCat = 0;

  if (!gameItem) {
    return;
  }

  for (const [key, criteria] of Object.entries(gameItem.criteria)) {
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

  numRatings.textContent = shortenNum(gameItem.numRatings);

  numComments.textContent = shortenNum(gameItem.numComments);
}

function loadComments(gameItem) {
  gameItem.comments.forEach((comment) => {
    const commentPost = document.createElement("article");

    commentPost.classList.add("post");

    const commentContent = document.createElement("p");

    commentContent.classList.add("post__comment");
    commentContent.textContent = comment.text;

    const commentTime = document.createElement("span");
    commentTime.classList.add("post__time");
    commentTime.dataset.timestamp = comment.timestamp;

    commentPost.appendChild(commentContent);
    commentPost.appendChild(commentTime);

    posts.appendChild(commentPost);
  })
}

function atualizarTemposDosPosts() {
  const tempos = document.querySelectorAll('.post__time');

  tempos.forEach((span) => {
    const data = span.dataset.timestamp;
    const tempo = tempoRelativo(data);

    if (tempo === 'agora') {
      span.textContent = 'Agora';
    } else if (tempo === '1 dia') {
      span.textContent = 'Ontem';
    } else {
      span.textContent = `Há ${tempo}`;
    }
  });
}

atualizarTemposDosPosts();
setInterval(atualizarTemposDosPosts, 60000);
