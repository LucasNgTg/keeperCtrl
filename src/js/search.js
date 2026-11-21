const numResults = document.getElementById("num-results");
const gameList = document.getElementById("results");
const searchTerm = document.getElementById("query");
const searchBox = document.getElementById("searchbox");

const navigation = document.getElementById("pagination-nav");
const pagination = document.getElementById("pagination");
const previous = document.getElementById("page-back");
const next = document.getElementById("page-forward");

const gameData = "src/data/games.json";

const GAMES_PER_PAGE = 6;

let gameCards = [];
let currentPage = 1;
let pageTotal = 0;

getData();

previous.addEventListener("click", () => showPage(currentPage - 1));
next.addEventListener("click", () => showPage(currentPage + 1));

window.addEventListener("popstate", () => {
  const page = Math.min(getPageFromURL(), pageTotal);

  showPage(page, false);
});

async function getData() {
  try {
    const response = await fetch(gameData);

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const games = await response.json();

    const params = new URLSearchParams(window.location.search);

    // optional chaining
    // nullish coalescing
    const query = params.get("q")?.trim() ?? "";

    if (!query) {
      window.location.replace("index.html");
      return;
    }

    searchBox.value = query;

    loadPage(games, query);
  } catch (e) {
    console.log(e.message);
  }
}

function loadPage(games, query) {
  searchTerm.textContent = query;
  document.title = `${query} - Pesquisa keeperCtrl`;

  const normalizedQuery = query.toLocaleLowerCase("pt-BR");

  const results = games.filter((game) => {
    // spread syntax
    const searchableText = [game.name, game.studio, game.desc, ...game.platforms]
      .join(" ")
      .toLocaleLowerCase("pt-BR");

    return searchableText.includes(normalizedQuery);
  });

  numResults.textContent = results.length;

  if (results.length === 0) {
    gameCards = [];
    gameList.textContent = "Nenhum jogo encontrado.";
    navigation.hidden = true;
    return;
  }

  gameCards = results.map((game, index) => createGameResult(game, index + 1));
  initializePagination(gameCards);
}

function createGameResult(game, index) {
  const stats = JSON.parse(localStorage.getItem(game.id));

  const result = document.createElement("a");
  result.href = `game.html?id=${encodeURIComponent(game.id)}`;
  result.classList.add("game-result");
  result.id = `game-result-${index}`;
  result.setAttribute("aria-labelledby", `game-title-${index}`);

  // Header
  const header = document.createElement("header");
  header.setAttribute("aria-label", "Informações do jogo");

  const gameInfo = document.createElement("div");
  gameInfo.classList.add("game-info");

  // Thumbnail
  const figure = document.createElement("figure");
  figure.classList.add("game-thumb");

  const img = document.createElement("img");
  img.src = game.img.cover;
  img.alt = `Capa de ${game.name}`;

  figure.appendChild(img);

  // Identificação do jogo
  const gameId = document.createElement("div");
  gameId.classList.add("game-id");

  const title = document.createElement("h2");
  title.id = `game-title-${index}`;
  title.classList.add("font-display");
  title.textContent = game.name;

  const release = document.createElement("p");
  release.classList.add("game-release", "clr-text");

  const year = document.createElement("span");
  year.classList.add("year");
  year.textContent = game.release;

  const studio = document.createElement("span");
  studio.classList.add("studio");
  studio.textContent = game.studio;

  release.append(year, " • ", studio);
  gameId.append(title, release);

  gameInfo.append(figure, gameId);

  // Nota
  const score = document.createElement("div");
  score.classList.add("game-score", "font-display");

  const gameScr = getScore(stats);

  if (gameScr) {
    if (gameScr >= 4) {
      score.classList.add("score-high");
    } else if (gameScr >= 2.5) {
      score.classList.add("score-medium");
    } else {
      score.classList.add("score-low");
    }
  } else {
    score.classList.add("no-score");
  }

  // Número da nota
  const scoreValue = document.createElement("p");
  scoreValue.textContent = gameScr ?? "-.-";

  score.append(createIcon("star"), scoreValue);
  header.append(gameInfo, score);

  // Descrição
  const description = document.createElement("p");
  description.classList.add("game-description", "clr-text");
  description.textContent = game.desc;

  const charLim = 196;
  if (description.textContent.length > charLim) {
    description.textContent = description.textContent.slice(0, charLim);
    description.textContent += "...";
  }

  // Footer
  const footer = document.createElement("footer");
  footer.setAttribute("aria-label", "Informações adicionais do jogo");

  const comments = document.createElement("div");
  comments.classList.add("game-comments", "clr-text");
  comments.id = `game-comments-${index}`;
  comments.setAttribute("aria-live", "polite");
  comments.setAttribute("aria-atomic", "true");

  const commentCount = document.createElement("p");
  commentCount.textContent = stats?.numComments ?? 0;

  comments.append(createIcon("chat"), commentCount);

  // Ver jogo
  const seeGame = document.createElement("div");
  seeGame.classList.add("see-game", "hl-text");

  const seeGameText = document.createElement("p");
  seeGameText.textContent = "Ver jogo";

  seeGame.append(seeGameText, createIcon("caret"));
  footer.append(comments, seeGame);

  // Assemble result
  result.append(header, description, footer);

  return result;
}

function createIcon(name) {
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("viewBox", "0 0 640 640");
  icon.setAttribute("aria-hidden", "true");
  icon.setAttribute("focusable", "false");

  const iconUse = document.createElementNS("http://www.w3.org/2000/svg", "use");
  iconUse.setAttribute("href", `assets/icons.svg#${name}`);
  icon.appendChild(iconUse);

  return icon;
}

function getScore(gameStats) {
  let total = 0;
  let ratedCat = 0;

  if (!gameStats) {
    return null;
  }

  for (const criteria of Object.values(gameStats.criteria)) {
    let rated = 0;
    let catSum = 0;

    for (const stats of Object.values(criteria)) {
      const statAverage = stats.sum / stats.count;

      if (stats.count > 0) {
        catSum += statAverage;
        rated++;
      }
    }

    if (rated > 0) {
      total += catSum / rated;
      ratedCat++;
    }
  }

  return ratedCat !== 0 ? (total / ratedCat).toFixed(1) : null;
}

function initializePagination(results) {
  pageTotal = Math.ceil(results.length / GAMES_PER_PAGE);
  currentPage = 1;

  if (pageTotal <= 1) {
    navigation.hidden = true;
    return;
  }

  const itemNext = next.closest("li");

  for (let page = 1; page <= pageTotal; page++) {
    const item = document.createElement("li");
    const btn = document.createElement("button");

    btn.type = "button";
    btn.classList.add("page-num", "font-display");
    btn.textContent = page;
    btn.setAttribute("aria-label", `Página ${page}`);
    btn.addEventListener("click", () => showPage(page));

    item.appendChild(btn);
    pagination.insertBefore(item, itemNext);
  }

  const initialPage = Math.min(getPageFromURL(), pageTotal);

  showPage(initialPage, false);
  navigation.hidden = false;
}

function showPage(page, updateURL = true) {
  if (page < 1 || page > pageTotal) {
    return;
  }

  currentPage = page;

  const renderStart = (currentPage - 1) * GAMES_PER_PAGE;
  const renderEnd = renderStart + GAMES_PER_PAGE;

  gameList.replaceChildren(...gameCards.slice(renderStart, renderEnd));

  previous.disabled = currentPage === 1;
  next.disabled = currentPage === pageTotal;

  const btns = pagination.querySelectorAll(".page-num");

  btns.forEach((btn, idx) => {
    const activePage = idx + 1 === currentPage;

    btn.classList.toggle("current-page", activePage);

    if (activePage) {
      btn.setAttribute("aria-current", "page");
    } else {
      btn.removeAttribute("aria-current");
    }
  });

  if (updateURL) {
    updatePageURL(page);
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

function getPageFromURL() {
  const params = new URLSearchParams(window.location.search);
  const page = Number(params.get("page"));

  return Number.isInteger(page) && page > 0 ? page : 1;
}

function updatePageURL(page) {
  const url = new URL(window.location.href);

  url.searchParams.set("page", page);

  history.pushState({}, "", url);
}
