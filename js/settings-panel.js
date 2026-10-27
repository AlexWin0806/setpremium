import { ICONS } from './icons.js';
import { THEMES, getSettings, updateSettings } from './settings.js';

// Settings drawer that slides in from the right over `host`. The page behind
// stays visible so customization changes can be seen as they're made.
export function createSettingsPanel(host, trigger) {
  host.insertAdjacentHTML(
    'beforeend',
    `
    <div class="scrim" data-action="close-settings"></div>
    <aside class="drawer" id="settings-panel" role="dialog" aria-labelledby="settings-title">
      <header class="drawer-header">
        <h2 id="settings-title">Settings</h2>
        <button class="icon-btn" type="button" data-action="close-settings" aria-label="Close settings">${ICONS.close}</button>
      </header>
      <div class="drawer-body">
        <section class="group" style="--i:0">
          <h3 class="group-title">Statistics</h3>
          <ul class="group-list">
            ${row('chart', 'Statistics', 'Soon')}
          </ul>
        </section>
        <section class="group" style="--i:1">
          <h3 class="group-title">Customization</h3>
          <ul class="group-list">
            <li class="theme-picker">
              <span class="row-icon">${ICONS.palette}</span>
              <span class="row-label" id="theme-label">Theme</span>
              <div class="theme-options" role="radiogroup" aria-labelledby="theme-label">
                ${THEMES.map(
                  (theme) => `
                  <button class="theme-option" type="button" role="radio" data-theme-id="${theme.id}">
                    <span class="theme-preview" data-theme="${theme.id}">
                      <span class="theme-preview-tile">${ICONS.classic}</span>
                    </span>
                    <span class="theme-name">${theme.name}</span>
                  </button>`,
                ).join('')}
              </div>
            </li>
            ${row('cards', 'Card design', 'Classic')}
          </ul>
        </section>
        <p class="drawer-note">More customization is coming soon.</p>
      </div>
    </aside>
  `,
  );
  const drawer = host.querySelector('.drawer');
  const themeOptions = [...drawer.querySelectorAll('.theme-option')];
  trigger.setAttribute('aria-controls', drawer.id);
  trigger.setAttribute('aria-expanded', 'false');

  const isOpen = () => host.classList.contains('settings-open');

  function setOpen(open) {
    if (open === isOpen()) return;
    host.classList.toggle('settings-open', open);
    trigger.setAttribute('aria-expanded', String(open));
    if (open) drawer.querySelector('[data-action="close-settings"]').focus({ preventScroll: true });
    else if (drawer.contains(document.activeElement)) trigger.focus({ preventScroll: true });
  }

  function renderTheme() {
    const current = getSettings().theme;
    for (const option of themeOptions) {
      const on = option.dataset.themeId === current;
      option.setAttribute('aria-checked', String(on));
      option.tabIndex = on ? 0 : -1;
    }
  }

  function chooseTheme(option) {
    updateSettings({ theme: option.dataset.themeId });
    renderTheme();
  }

  const onKey = (event) => {
    if (event.key === 'Escape') setOpen(false);
  };
  trigger.addEventListener('click', () => setOpen(!isOpen()));
  host.addEventListener('click', (event) => {
    if (event.target.closest('[data-action="close-settings"]')) setOpen(false);
    const option = event.target.closest('.theme-option');
    if (option) chooseTheme(option);
  });
  // Arrow keys move between theme options, as in a native radio group.
  drawer.querySelector('.theme-options').addEventListener('keydown', (event) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const at = themeOptions.indexOf(document.activeElement);
    const next = themeOptions[(at + step + themeOptions.length) % themeOptions.length];
    next.focus();
    chooseTheme(next);
  });
  document.addEventListener('keydown', onKey);
  renderTheme();

  return () => document.removeEventListener('keydown', onKey);
}

function row(icon, label, detail) {
  return `
    <li class="row">
      <span class="row-icon">${ICONS[icon]}</span>
      <span class="row-label">${label}</span>
      <span class="row-detail">${detail}</span>
    </li>`;
}
