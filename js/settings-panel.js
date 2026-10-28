import { CARD_DESIGNS, designIcon, getDesign } from './cards.js';
import { formatTime } from './format.js';
import { ICONS } from './icons.js';
import { CARD_TEXTURES, THEMES, getSettings, updateSettings } from './settings.js';
import { bestTime, getStats } from './stats.js';

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
            ${row('layers', 'Sets found', '<span data-stat="sets-found"></span>')}
            ${row('trophy', 'Fastest Classic', '<span data-stat="best-classic"></span>')}
            ${row('fastFive', 'Fastest Fast Five', '<span data-stat="best-fast-five"></span>')}
          </ul>
        </section>
        <section class="group" style="--i:1">
          <h3 class="group-title">Customization</h3>
          <ul class="group-list">
            ${picker(
              'theme',
              'palette',
              'Theme',
              THEMES.map((theme) => ({
                id: theme.id,
                name: theme.name,
                preview: `<span class="choice-preview" data-theme="${theme.id}">
                  <span class="choice-preview-tile">${designIcon(CARD_DESIGNS[0])}</span>
                </span>`,
              })),
            )}
            ${picker(
              'cardDesign',
              'cards',
              'Card design',
              CARD_DESIGNS.map((design) => ({
                id: design.id,
                name: design.name,
                preview: `<span class="choice-preview">${designIcon(design)}</span>`,
              })),
            )}
            ${picker(
              'cardTexture',
              'texture',
              'Card texture',
              CARD_TEXTURES.map((texture) => ({
                id: texture.id,
                name: texture.name,
                preview: `<span class="choice-preview">
                  <span class="texture-swatch" data-card-texture="${texture.id}"></span>
                </span>`,
              })),
            )}
          </ul>
        </section>
        <p class="drawer-note">Settings and statistics are saved on this device.</p>
      </div>
    </aside>
  `,
  );
  const drawer = host.querySelector('.drawer');
  const choices = [...drawer.querySelectorAll('.choice')];
  trigger.setAttribute('aria-controls', drawer.id);
  trigger.setAttribute('aria-expanded', 'false');

  const isOpen = () => host.classList.contains('settings-open');

  function setOpen(open) {
    if (open === isOpen()) return;
    if (open) renderStats();
    host.classList.toggle('settings-open', open);
    trigger.setAttribute('aria-expanded', String(open));
    if (open) drawer.querySelector('[data-action="close-settings"]').focus({ preventScroll: true });
    else if (drawer.contains(document.activeElement)) trigger.focus({ preventScroll: true });
  }

  function renderStats() {
    const best = (mode) => (bestTime(mode) === null ? '—' : formatTime(bestTime(mode)));
    drawer.querySelector('[data-stat="sets-found"]').textContent = getStats().setsFound.toLocaleString();
    drawer.querySelector('[data-stat="best-classic"]').textContent = best('classic');
    drawer.querySelector('[data-stat="best-fast-five"]').textContent = best('fast-five');
  }

  function renderChoices() {
    const settings = getSettings();
    // Texture swatches show a card in the current design.
    const icon = designIcon(getDesign(settings.cardDesign));
    for (const swatch of drawer.querySelectorAll('.texture-swatch')) swatch.innerHTML = icon;
    for (const choice of choices) {
      const on = settings[choice.dataset.setting] === choice.dataset.value;
      choice.setAttribute('aria-checked', String(on));
      choice.tabIndex = on ? 0 : -1;
      if (on) choice.closest('.picker').querySelector('.picker-current').textContent = choice.dataset.name;
    }
  }

  function togglePicker(picker) {
    const open = !picker.classList.contains('open');
    picker.classList.toggle('open', open);
    picker.querySelector('.picker-toggle').setAttribute('aria-expanded', String(open));
    picker.querySelector('.picker-panel').inert = !open;
  }

  function choose(choice) {
    updateSettings({ [choice.dataset.setting]: choice.dataset.value });
    renderChoices();
  }

  const onKey = (event) => {
    if (event.key === 'Escape') setOpen(false);
  };
  trigger.addEventListener('click', () => setOpen(!isOpen()));
  host.addEventListener('click', (event) => {
    if (event.target.closest('[data-action="close-settings"]')) setOpen(false);
    const toggle = event.target.closest('.picker-toggle');
    if (toggle) togglePicker(toggle.closest('.picker'));
    const choice = event.target.closest('.choice');
    if (choice) choose(choice);
  });
  // Arrow keys move between options in a picker, as in a native radio group.
  drawer.addEventListener('keydown', (event) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    const group = step && event.target.closest('.choices');
    if (!group) return;
    event.preventDefault();
    const options = [...group.querySelectorAll('.choice')];
    const next = options[(options.indexOf(event.target) + step + options.length) % options.length];
    next.focus();
    choose(next);
  });
  document.addEventListener('keydown', onKey);
  renderChoices();

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

// A dropdown row for one setting: shows the current choice, and opens to a
// grid of visual options. Starts closed.
function picker(setting, icon, label, options) {
  const labelId = `${setting}-label`;
  return `
    <li class="picker">
      <button class="picker-toggle" type="button" aria-expanded="false" aria-controls="${setting}-options">
        <span class="row-icon">${ICONS[icon]}</span>
        <span class="row-label" id="${labelId}">${label}</span>
        <span class="row-detail picker-current"></span>
        <span class="picker-chevron">${ICONS.chevron}</span>
      </button>
      <div class="picker-panel" id="${setting}-options" inert>
        <div class="picker-panel-inner">
          <div class="choices" role="radiogroup" aria-labelledby="${labelId}">
            ${options
              .map(
                (option) => `
              <button class="choice" type="button" role="radio" data-setting="${setting}"
                data-value="${option.id}" data-name="${option.name}">
                ${option.preview}
                <span class="choice-name">${option.name}</span>
              </button>`,
              )
              .join('')}
          </div>
        </div>
      </div>
    </li>`;
}
