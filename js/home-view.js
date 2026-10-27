import { ICONS } from './icons.js';
import { MODES } from './modes.js';
import { go } from './router.js';
import { createSettingsPanel } from './settings-panel.js';

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
            ${mode.view ? '' : 'aria-disabled="true"'}>
            ${mode.view ? '' : '<span class="badge">Soon</span>'}
            <span class="mode-icon">${ICONS[mode.icon]}</span>
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

  root.append(view);
  return destroySettings;
}
