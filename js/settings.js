import { CARD_DESIGNS } from './cards.js';
import { load, save } from './storage.js';

// Each theme's colours live in css/styles.css under [data-theme='<id>'].
// A theme covers the whole look: background, surfaces and card colours.
export const THEMES = [
  { id: 'classic-dark', name: 'Classic Dark' },
  { id: 'classic-light', name: 'Classic Light' },
];

// Settings are saved in this browser (localStorage), so each device — desktop
// browser, phone browser, home-screen app — remembers its own last choices.
const DEFAULTS = { theme: 'classic-dark', cardDesign: 'classic' };

let settings = { ...DEFAULTS, ...load('settings', {}) };
if (!THEMES.some((t) => t.id === settings.theme)) settings.theme = DEFAULTS.theme;
if (!CARD_DESIGNS.some((d) => d.id === settings.cardDesign)) settings.cardDesign = DEFAULTS.cardDesign;

export function getSettings() {
  return settings;
}

// Saves the change and fires a `settingschange` event on window so open
// screens can update live.
export function updateSettings(patch) {
  const themeChanged = patch.theme && patch.theme !== settings.theme;
  settings = { ...settings, ...patch };
  save('settings', settings);
  applySettings({ animate: themeChanged });
  window.dispatchEvent(new CustomEvent('settingschange', { detail: settings }));
}

export function applySettings({ animate = false } = {}) {
  const root = document.documentElement;
  if (animate) {
    root.classList.add('theme-switching');
    setTimeout(() => root.classList.remove('theme-switching'), 400);
  }
  root.dataset.theme = settings.theme;
  // Browser / status-bar colour follows the theme background.
  const bg = getComputedStyle(root).getPropertyValue('--bg').trim();
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bg);
}
