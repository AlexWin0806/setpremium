import { load, save } from './storage.js';

// Statistics are saved in this browser (localStorage). Lifetime totals live
// apart from the game history, which is capped, so they never lose data.
const MAX_GAMES = 500;

let totals = load('stats', null) ?? totalsFromHistory(getGames());

export function getGames() {
  return load('games', []);
}

export function getStats() {
  return totals;
}

// Called for every set found, finished game or not.
export function recordSet() {
  totals = { ...totals, setsFound: totals.setsFound + 1 };
  save('stats', totals);
}

export function recordGame(result) {
  const games = getGames();
  games.push({ ...result, date: new Date().toISOString() });
  save('games', games.slice(-MAX_GAMES));

  const best = totals.bestTimes[result.mode];
  if (best === undefined || result.timeMs < best) {
    totals = { ...totals, bestTimes: { ...totals.bestTimes, [result.mode]: result.timeMs } };
    save('stats', totals);
  }
}

export function bestTime(mode) {
  return totals.bestTimes[mode] ?? null;
}

// Builds totals from games recorded before lifetime totals existed.
function totalsFromHistory(games) {
  const bestTimes = {};
  for (const g of games) {
    if (!(g.mode in bestTimes) || g.timeMs < bestTimes[g.mode]) bestTimes[g.mode] = g.timeMs;
  }
  return { setsFound: games.reduce((sum, g) => sum + g.sets, 0), bestTimes };
}
