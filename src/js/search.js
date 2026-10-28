const numResults = document.getElementById("num-results");
const gameList = document.getElementById("results");
const searchTerm = document.getElementById("query");

const searchBox = document.getElementById("searchbox");

const gameData = "src/data/games.json";

getData();

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
    gameList.textContent = "Nenhum jogo encontrado.";
    return;
  }

  results.forEach((game, index) => {
    const result = createGameResult(game, index + 1);
    gameList.appendChild(result);
  });
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

  const star = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  star.setAttribute("viewBox", "0 0 640 640");
  star.setAttribute("aria-hidden", "true");
  star.setAttribute("focusable", "false");

  const starUse = document.createElementNS("http://www.w3.org/2000/svg", "use");
  starUse.setAttribute("href", "assets/icons.svg#star");
  star.appendChild(starUse);

  // Número da nota
  const scoreValue = document.createElement("p");
  scoreValue.textContent = gameScr ?? "-.-";

  score.append(star, scoreValue);
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

  const chat = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  chat.setAttribute("viewBox", "0 0 640 640");
  chat.setAttribute("aria-hidden", "true");
  chat.setAttribute("focusable", "false");

  const chatUse = document.createElementNS("http://www.w3.org/2000/svg", "use");
  chatUse.setAttribute("href", "assets/icons.svg#chat");
  chat.appendChild(chatUse);

  const commentCount = document.createElement("p");
  commentCount.textContent = stats?.numComments ?? 0

  comments.append(chat, commentCount);

  // Ver jogo
  const seeGame = document.createElement("div");
  seeGame.classList.add("see-game", "hl-text");

  const seeGameText = document.createElement("p");
  seeGameText.textContent = "Ver jogo";

  const caret = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  caret.setAttribute("viewBox", "0 0 640 640");
  caret.setAttribute("aria-hidden", "true");
  caret.setAttribute("focusable", "false");

  const caretUse = document.createElementNS("http://www.w3.org/2000/svg", "use");
  caretUse.setAttribute("href", "assets/icons.svg#caret");
  caret.appendChild(caretUse);

  seeGame.append(seeGameText, caret);
  footer.append(comments, seeGame);

  // Assemble result
  result.append(header, description, footer);

  return result;
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

  return (total / ratedCat).toFixed(1);
}
