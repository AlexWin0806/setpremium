import { ICONS } from './icons.js';
import { MODES } from './modes.js';
import { go } from './router.js';

export function mountHome(root) {
  const view = document.createElement('div');
  view.className = 'view home';
  view.innerHTML = `
    <header class="home-header">
      <h1 class="logo">SET</h1>
      <button class="icon-btn settings-btn" type="button" aria-label="Settings">${ICONS.settings}</button>
    </header>
    <main class="modes" aria-label="Game modes">
      ${MODES.map(
        (mode, i) => `
        <button class="mode-tile" type="button" data-mode="${mode.id}" style="--i:${i}"
          ${mode.view ? '' : 'aria-disabled="true"'}>
          ${mode.view ? '' : '<span class="badge">Soon</span>'}
          <span class="mode-icon">${ICONS[mode.icon]}</span>
          <span class="mode-name">${mode.name}</span>
          <span class="mode-tagline">${mode.tagline}</span>
        </button>`,
      ).join('')}
    </main>
  `;

  view.querySelector('.settings-btn').addEventListener('click', () => go('/settings'));
  view.querySelector('.modes').addEventListener('click', (event) => {
    const tile = event.target.closest('.mode-tile');
    if (tile && !tile.hasAttribute('aria-disabled')) go(`/play/${tile.dataset.mode}`);
  });

  root.append(view);
}
