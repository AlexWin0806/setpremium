// Game modes shown on the home screen. Modes with `playable` open the game
// screen (js/game-view.js); the rest show as "Soon" placeholders.
// `targetSets` ends the game once that many sets are found.
export const MODES = [
  {
    id: 'classic',
    name: 'Classic',
    tagline: 'Clear all 81 cards',
    icon: 'design', // the current card design's three shapes
    playable: true,
  },
  {
    id: 'fast-five',
    name: 'Fast Five',
    tagline: 'Five sets, fast',
    icon: 'fastFive',
    playable: true,
    targetSets: 5,
  },
  { id: 'daily', name: 'Daily', tagline: 'One puzzle a day', icon: 'calendar' },
  { id: 'zen', name: 'Zen', tagline: 'Endless, no clock', icon: 'infinity' },
];

export function findMode(id) {
  return MODES.find((m) => m.id === id && m.playable);
}
