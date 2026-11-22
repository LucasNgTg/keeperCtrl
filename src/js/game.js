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
const showMoreBtn = document.getElementById("show-more-btn");

const statDetails = document.querySelectorAll(".stat-details");

const badgeItems = document.getElementById("badge-items");

const gameData = "src/data/games.json";

const params = new URLSearchParams(window.location.search);
const gameId = params.get("id");
const gameItem = JSON.parse(localStorage.getItem(gameId));

const INIT_COMMENT_COUNT = 4;
const LOAD_COMMENT_COUNT = 4;

let dispCommentCount = INIT_COMMENT_COUNT;

if (!gameId) {
  window.location.replace("index.html");
  throw new Error("ID ausente");
}

if (!getData(gameId)) {
  window.location.replace("index.html");
  throw new Error("ID inválido");
}

if (gameItem) {
  loadStats(gameItem);
  loadComments(gameItem);
  showBadges();
} else {
  showMoreBtn.disabled = true;
}

setInterval(updatePostTime, 60000);

// adiciona animação às sanfonas
statDetails.forEach((details) => {
  const summary = details.querySelector("summary");
  const accordion = details.querySelector(".stat-accordion");

  summary.addEventListener("click", (e) => {
    e.preventDefault();

    if (!details.open) {
      details.open = true;
      accordion.inert = false;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          details.classList.add("expanded");
        });
      });
    } else {
      details.classList.remove("expanded");
      accordion.inert = true;

      details.addEventListener("transitionend", function handler() {
        details.open = false;
        details.removeEventListener("transitionend", handler);
      });
    }
  });
});

showMoreBtn.addEventListener("click", function handler() {
  const gameItem = JSON.parse(localStorage.getItem(gameId));
  dispCommentCount += LOAD_COMMENT_COUNT;
  loadComments(gameItem);

  if (dispCommentCount >= gameItem.comments.length) {
    showMoreBtn.removeEventListener("click", handler);
  }
});

async function getData(game) {
  try {
    const response = await fetch(gameData);

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const gameInfo = await response.json();
    return loadPage(gameInfo, game);
  } catch (e) {
    console.log(e.message);
  }
}

function loadPage(gameInfo, gameId) {
  const game = gameInfo.find((item) => item.id === gameId);

  if (!game) {
    console.error("Jogo não encontrado.");
    window.location.replace("index.html");
    return false;
  }

  document.title = `${game.name} | keeperCtrl`;

  title.textContent = game.name;
  modalTitle.textContent = game.name;

  cover.src = game.img.cover;
  cover.alt = `Capa de ${game.name}`;
  modalCover.src = game.img.cover;
  modalCover.alt = `Capa de ${game.name}`;

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

  return true;
}

function loadStats(gameItem) {
  let total = 0;
  let ratedCat = 0;

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
  posts.replaceChildren();

  const visibleComments = gameItem.comments.slice(0, dispCommentCount);

  visibleComments.forEach((comment) => {
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
  });

  showMoreBtn.disabled = dispCommentCount >= gameItem.comments.length;
  updatePostTime();
}

function updatePostTime() {
  const times = document.querySelectorAll(".post__time");

  times.forEach((span) => {
    const date = span.dataset.timestamp;
    const time = relativeTime(date);

    if (time === "agora") {
      span.textContent = "Agora";
    } else if (time === "1 dia") {
      span.textContent = "Ontem";
    } else {
      span.textContent = `Há ${time}`;
    }
  });
}

async function showBadges() {
  if (gameItem.numRatings < 20) {
    return;
  }

  try {
    const response = await fetch("src/data/badges.json");

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const badges = await response.json();

    const minCount = 0.75 * gameItem.numRatings;

    let replaceBadges = true;

    for (const [badge, count] of Object.entries(gameItem.badges)) {
      if (count >= minCount) {
        if (replaceBadges) {
          badgeItems.replaceChildren();
          replaceBadges = false;
        }

        const badgeObj = badges.find(b => b.id === badge);

        const listItem = document.createElement("li");

        const badgeBtn = document.createElement("button");
        badgeBtn.className = `font-display badge badge-${badgeObj.nature}`
        badgeBtn.type = "button";
        badgeBtn.setAttribute("popovertarget", `hint__${badge}`)

        const badgeName = document.createElement("p");
        badgeName.textContent = badgeObj.name;
        badgeName.className = "badge-name";

        const badgeIcon = createIcon(badgeObj.icon);
        badgeIcon.classList.add("badge-icon");

        badgeBtn.append(badgeIcon, badgeName);

        const badgeHint = document.createElement("p");
        badgeHint.textContent = badgeObj.description;
        badgeHint.id = `hint__${badge}`;
        badgeHint.className = "hint-content";
        badgeHint.popover = "auto";

        listItem.append(badgeBtn, badgeHint);
        badgeItems.append(listItem);
      }
    }
  } catch (error) {
    console.error("Não foi possível carregar os selos:", error);
  }
}
