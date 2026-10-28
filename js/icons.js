// Inline SVG icons (24 × 24, stroked with currentColor).

const svg = (body) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" ` +
  `stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

export const ICONS = {
  back: svg('<path d="m15 18-6-6 6-6"/>'),
  chevron: svg('<path d="m6 9 6 6 6-6"/>'),
  close: svg('<path d="M18 6 6 18M6 6l12 12"/>'),
  settings: svg(
    '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>' +
      '<circle cx="12" cy="12" r="3"/>',
  ),
  fastFive: svg('<path d="M20 4h-7l-1 6.5a5 5 0 1 1-1.5 7.5"/><path d="M2 9h5M3 13h4M2 17h4"/>'),
  calendar: svg('<rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/>'),
  infinity: svg(
    '<path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z"/>',
  ),
  layers: svg('<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/>'),
  trophy: svg('<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4ZM17 6h3v1a3 3 0 0 1-3 3M7 6H4v1a3 3 0 0 0 3 3"/>'),
  palette: svg('<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18Z" fill="currentColor"/>'),
  texture: svg('<rect x="4" y="3" width="16" height="18" rx="2.5"/><path d="M8 8.5c2-1 3 1 5 0s3-1 3-1M8 12.5c2-1 3 1 5 0s3-1 3-1M8 16.5c2-1 3 1 5 0s3-1 3-1"/>'),
  cards: svg('<rect x="7" y="3" width="10" height="16" rx="2"/><path d="M4 7v11a3 3 0 0 0 3 3h7"/>'),
};
