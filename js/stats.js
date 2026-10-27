import { load, save } from './storage.js';

// Finished games are recorded now so the future statistics screen has history
// to show from day one.
const MAX_GAMES = 500;

export function getGames() {
  return load('games', []);
}

export function recordGame(result) {
  const games = getGames();
  games.push({ ...result, date: new Date().toISOString() });
  save('games', games.slice(-MAX_GAMES));
}

export function bestTime(mode) {
  const times = getGames()
    .filter((g) => g.mode === mode)
    .map((g) => g.timeMs);
  return times.length ? Math.min(...times) : null;
}
