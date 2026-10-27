import { designIcon, getDesign } from './cards.js';
import { ICONS } from './icons.js';
import { MODES } from './modes.js';
import { go } from './router.js';
import { getSettings } from './settings.js';
import { createSettingsPanel } from './settings-panel.js';

const modeIcon = (mode) =>
  mode.icon === 'design' ? designIcon(getDesign(getSettings().cardDesign)) : ICONS[mode.icon];

export function mountHome(root) {
  const view = document.createElement('div');
  view.className = 'view home';
  view.innerHTML = `
    <button class="icon-btn settings-btn" type="button" aria-label="Settings">${ICONS.settings}</button>
    <div class="home-content">
      <header class="home-header">
        <h1 class="logo">SET</h1>
      </header>
      <main class="modes" aria-label="Game modes">
        ${MODES.map(
          (mode) => `
          <button class="mode-tile" type="button" data-mode="${mode.id}"
            ${mode.playable ? '' : 'aria-disabled="true"'}>
            ${mode.playable ? '' : '<span class="badge">Soon</span>'}
            <span class="mode-icon">${modeIcon(mode)}</span>
            <span class="mode-name">${mode.name}</span>
            <span class="mode-tagline">${mode.tagline}</span>
          </button>`,
        ).join('')}
      </main>
    </div>
  `;

  view.querySelector('.modes').addEventListener('click', (event) => {
    const tile = event.target.closest('.mode-tile');
    if (tile && !tile.hasAttribute('aria-disabled')) go(`/play/${tile.dataset.mode}`);
  });
  const destroySettings = createSettingsPanel(view, view.querySelector('.settings-btn'));

  // Show a new card design on the mode tiles straight away.
  const onSettingsChange = () => {
    for (const mode of MODES) {
      if (mode.icon === 'design') view.querySelector(`[data-mode="${mode.id}"] .mode-icon`).innerHTML = modeIcon(mode);
    }
  };
  window.addEventListener('settingschange', onSettingsChange);

  root.append(view);
  return () => {
    destroySettings();
    window.removeEventListener('settingschange', onSettingsChange);
  };
}
