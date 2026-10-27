import { installCardDefs } from './cards.js';
import { mountHome } from './home-view.js';
import { findMode } from './modes.js';
import { startRouter } from './router.js';
import { applySettings } from './settings.js';
import { mountSettings } from './settings-view.js';

applySettings();
installCardDefs();

startRouter(
  [
    [/^\/$/, () => mountHome],
    [/^\/settings$/, () => mountSettings],
    [/^\/play\/([\w-]+)$/, (id) => findMode(id)?.view],
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
