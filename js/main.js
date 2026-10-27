import { installCardDefs } from './cards.js';
import { mountGame } from './game-view.js';
import { mountHome } from './home-view.js';
import { findMode } from './modes.js';
import { startRouter } from './router.js';
import { applySettings } from './settings.js';

applySettings();
installCardDefs();

startRouter(
  [
    [/^\/$/, () => mountHome],
    [
      /^\/play\/([\w-]+)$/,
      (id) => {
        const mode = findMode(id);
        return mode && ((root) => mountGame(root, mode));
      },
    ],
  ],
  document.getElementById('app'),
);

// Offline support for the home-screen app. Service workers only exist in
// secure contexts (https or localhost).
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
