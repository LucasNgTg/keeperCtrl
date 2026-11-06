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

  document.querySelector('.stat__games').textContent = shortenNum(jogos.length);
  document.querySelector('.stat__ratings').textContent = shortenNum(totalAvaliacoes);
}

carregarEstatisticas();