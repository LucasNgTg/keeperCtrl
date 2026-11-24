const numGames = document.getElementById("num-games");
const numRatings = document.getElementById("num-ratings");

displayStats();

async function displayStats() {
  const response = await fetch('src/data/games.json');
  const games = await response.json();

  let totalRatings = 0;

  games.forEach((game) => {
    const gameStats = getGameItem(game.id);
    if (gameStats) {
      totalRatings += gameStats.numRatings || 0;
    }
  });

  numGames.textContent = shortenNum(games.length);
  numRatings.textContent = shortenNum(totalRatings);
}
