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

  // Montar card
  result.append(header, description, footer);

  return result;
}

// Calcula a pontuação total do jogo
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

// Inicia a paginação dos resultados
function initializePagination(results) {
  pageTotal = Math.ceil(results.length / GAMES_PER_PAGE);
  currentPage = 1;

  // Se não houver resultados, ocultar a navegação
  if (pageTotal === 0) {
    navigation.hidden = true;
    return;
  }

  // Garante que o número da página solicitado
  // não ultrapasse o total disponível
  const initialPage = Math.min(getPageFromURL(), pageTotal);

  // Mostra a página sem mudar a URL
  showPage(initialPage, false);

  // Se houver apenas uma página, ocultar a navegação
  navigation.hidden = pageTotal <= 1;
}

function showPage(page, updateURL = true) {
  // Se a página estiver fora dos limites estabelecidos, não fazer nada
  if (page < 1 || page > pageTotal) {
    return;
  }

  // Atualiza a página atual
  currentPage = page;

  // Estabelece o intervalo de cards exibidos na página
  const renderStart = (currentPage - 1) * GAMES_PER_PAGE;
  const renderEnd = renderStart + GAMES_PER_PAGE;

  gameList.replaceChildren(...gameCards.slice(renderStart, renderEnd));

  previous.disabled = currentPage === 1;
  next.disabled = currentPage === pageTotal;

  renderPagination();

  // Atualiza a URL
  if (updateURL) {
    updatePageURL(page);
  }

  // Rola para o início
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

// Verifica se a página na URL é válida e a retorna
function getPageFromURL() {
  const params = new URLSearchParams(window.location.search);
  const page = Number(params.get("page"));

  return Number.isInteger(page) && page > 0 ? page : 1;
}

// Atualiza o histórico e atualiza o parâmetro page na URL
function updatePageURL(page) {
  const url = new URL(window.location.href);

  url.searchParams.set("page", page);

  // Adiciona a URL com page no histórico
  history.pushState({}, "", url);
}

// Retorna a lista de páginas que devem ser exibidas na navegação
function getVisiblePages(currentPage, pageTotal) {
  // Armazena valores únicos
  const pages = new Set();

  // Três primeiras páginas
  for (let page = 1; page <= Math.min(3, pageTotal); page++) {
    pages.add(page);
  }

  // Duas páginas anteriores, a atual e duas posteriores
  const firstVisible = Math.max(1, currentPage - 2);
  const lastVisible = Math.min(pageTotal, currentPage + 2);

  for (let page = firstVisible; page <= lastVisible; page++) {
    pages.add(page);
  }

  // Três últimas páginas
  for (let page = Math.max(1, pageTotal - 2); page <= pageTotal; page++) {
    pages.add(page);
  }

  // Cria uma lista a partir do conjunto e
  // a ordena numericamente
  const sortedPages = [...pages].sort((a, b) => a - b);

  const visiblePages = [];

  for (let i = 0; i < sortedPages.length; i++) {
    const page = sortedPages[i];
    const previousPage = sortedPages[i - 1];

    // Quando houver duas páginas não consecutivas,
    // adicionar reticências
    if (previousPage && page - previousPage > 1) {
      visiblePages.push("…");
    }

    visiblePages.push(page);
  }

  return visiblePages;
}

// Exibe as páginas na navegação
function renderPagination() {
  // Seleciona a li que contém o botão next
  const itemNext = next.closest("li");

  // Remove os botões e as reticências anteriores
  pagination.querySelectorAll(".page-num, .page-ellipsis").forEach((element) => {
    element.closest("li").remove();
  });

  const visiblePages = getVisiblePages(currentPage, pageTotal);

  for (const page of visiblePages) {
    const item = document.createElement("li");

    if (page === "…") {
      item.classList.add("page-ellipsis");
      item.textContent = "…";
      item.setAttribute("aria-hidden", "true");
    } else {
      const btn = document.createElement("button");

      btn.type = "button";
      btn.classList.add("page-num", "font-display");
      btn.textContent = page;
      btn.setAttribute("aria-label", `Página ${page}`);

      const activePage = page === currentPage;

      btn.classList.toggle("current-page", activePage);

      if (activePage) {
        btn.setAttribute("aria-current", "page");
      }

      btn.addEventListener("click", () => showPage(page));

      item.appendChild(btn);
    }

    pagination.insertBefore(item, itemNext);
  }
}
