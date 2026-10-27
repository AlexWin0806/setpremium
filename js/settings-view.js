import { ICONS } from './icons.js';
import { back } from './router.js';

// Placeholder layout for the settings screen. Rows become interactive as the
// statistics and customization features land.
const SECTIONS = [
  {
    title: 'Statistics',
    rows: [{ icon: 'chart', label: 'Statistics', detail: 'Soon' }],
  },
  {
    title: 'Customization',
    rows: [
      { icon: 'palette', label: 'Theme', detail: 'Dark' },
      { icon: 'image', label: 'Background', detail: 'Soon' },
      { icon: 'cards', label: 'Card design', detail: 'Classic' },
    ],
  },
];

export function mountSettings(root) {
  const view = document.createElement('div');
  view.className = 'view page';
  view.innerHTML = `
    <header class="page-header">
      <button class="icon-btn" type="button" data-action="back" aria-label="Back">${ICONS.back}</button>
      <h1>Settings</h1>
      <span class="icon-btn-spacer"></span>
    </header>
    <main class="page-body">
      ${SECTIONS.map(
        (section) => `
        <section class="group">
          <h2 class="group-title">${section.title}</h2>
          <ul class="group-list">
            ${section.rows
              .map(
                (row) => `
              <li class="row">
                <span class="row-icon">${ICONS[row.icon]}</span>
                <span class="row-label">${row.label}</span>
                <span class="row-detail">${row.detail}</span>
              </li>`,
              )
              .join('')}
          </ul>
        </section>`,
      ).join('')}
      <p class="page-note">More customization is coming soon.</p>
    </main>
  `;
  view.querySelector('[data-action="back"]').addEventListener('click', back);
  root.append(view);
}
