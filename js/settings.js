import { load, save } from './storage.js';

// User preferences. Only the theme exists today; backgrounds, card designs,
// etc. will join it as the customization section grows.
const DEFAULTS = { theme: 'dark' };

let settings = { ...DEFAULTS, ...load('settings', {}) };

export function getSettings() {
  return settings;
}

export function updateSettings(patch) {
  settings = { ...settings, ...patch };
  save('settings', settings);
  applySettings();
}

export function applySettings() {
  document.documentElement.dataset.theme = settings.theme;
}
