// Game modes shown on the home screen. `view` is set for playable modes;
// the rest show as "Soon" placeholders until they're built.
import { mountGame } from './game-view.js';

export const MODES = [
  {
    id: 'classic',
    name: 'Classic',
    tagline: 'Clear all 81 cards',
    icon: 'classic',
    view: mountGame,
  },
  { id: 'timed', name: 'Time Attack', tagline: 'Race the clock', icon: 'timer' },
  { id: 'daily', name: 'Daily', tagline: 'One puzzle a day', icon: 'calendar' },
  { id: 'zen', name: 'Zen', tagline: 'Endless, no clock', icon: 'infinity' },
];

export function findMode(id) {
  return MODES.find((m) => m.id === id && m.view);
}
