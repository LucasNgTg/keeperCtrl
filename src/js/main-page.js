const numGames = document.getElementById("num-games");
const numRatings = document.getElementById("num-ratings");

async function carregarEstatisticas() {
  const resposta = await fetch('src/data/games.json');
  const jogos = await resposta.json();

  let totalAvaliacoes = 0;

  jogos.forEach((jogo) => {
    const gameStats = JSON.parse(localStorage.getItem(jogo.id));
    if (gameStats) {
      totalAvaliacoes += gameStats.numRatings || 0;
    }
  });

  numGames.textContent = shortenNum(jogos.length);
  numRatings.textContent = shortenNum(totalAvaliacoes);
}

carregarEstatisticas();
