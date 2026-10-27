import { CARD_RATIO, cardSVG, describeCard, getDesign } from './cards.js';
import { formatTime } from './format.js';
import { ICONS } from './icons.js';
import { back } from './router.js';
import { SetGame } from './set-game.js';
import { getSettings } from './settings.js';
import { bestTime, recordGame, recordSet } from './stats.js';

const MAX_CARD_LONG_SIDE = 340; // px, so cards don't get silly on big screens
const DEAL_STAGGER_MS = 45;
const FOUND_MS = 280;
const WRONG_MS = 380;

// `mode` is an entry from modes.js; `mode.targetSets` ends the game early.
export function mountGame(root, mode) {
  const target = mode.targetSets ?? null;
  const view = document.createElement('div');
  view.className = 'view game';
  view.innerHTML = `
    <header class="game-bar">
      <button class="icon-btn" type="button" data-action="back" aria-label="Back to menu">${ICONS.back}</button>
      <div class="game-stats">
        <div class="stat stat-time"><span class="stat-value" data-stat="time"></span><span class="stat-label">Time</span></div>
        <div class="stat stat-time stat-best"><span class="stat-value" data-stat="best"></span><span class="stat-label">Best</span></div>
        <div class="stat"><span class="stat-value" data-stat="sets"></span><span class="stat-label">Sets</span></div>
        <div class="stat"><span class="stat-value" data-stat="deck">0</span><span class="stat-label">Deck</span></div>
      </div>
      <span class="icon-btn-spacer"></span>
    </header>
    <main class="board-wrap">
      <div class="board" role="group" aria-label="Cards on the table"></div>
    </main>
    <div class="visually-hidden" aria-live="polite" data-announce></div>
  `;
  root.append(view);

  const board = view.querySelector('.board');
  const wrap = view.querySelector('.board-wrap');
  const stat = (name) => view.querySelector(`[data-stat="${name}"]`);
  const timeEl = stat('time');
  const setsEl = stat('sets');
  const deckEl = stat('deck');
  const bestEl = stat('best');
  const announcer = view.querySelector('[data-announce]');

  const design = getDesign(getSettings().cardDesign);
  const cards = new Map(); // card id -> element
  let game;
  let selected = []; // card ids
  let busy = false;
  let disposed = false;
  let orientation = 'portrait';
  const clock = new Clock();

  // ---- Rendering -----------------------------------------------------------

  function renderBoard() {
    const onBoard = new Set(game.board);
    for (const [id, el] of cards) {
      if (!onBoard.has(id)) {
        el.remove();
        cards.delete(id);
      }
    }
    let dealt = 0;
    game.board.forEach((id, i) => {
      let el = cards.get(id);
      if (!el) {
        el = createCard(id);
        el.style.animationDelay = `${dealt++ * DEAL_STAGGER_MS}ms`;
        board.append(el);
        cards.set(id, el);
      }
      // Grid position comes from `order`, so existing cards never move in the DOM.
      el.style.order = i;
    });
    layout();
    renderStats();
  }

  function createCard(id) {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'card deal';
    el.dataset.id = id;
    el.setAttribute('aria-label', describeCard(id, design));
    el.setAttribute('aria-pressed', 'false');
    el.innerHTML = cardSVG(id, orientation, design);
    return el;
  }

  function renderSelection() {
    for (const [id, el] of cards) {
      const on = selected.includes(id);
      el.classList.toggle('selected', on);
      el.setAttribute('aria-pressed', String(on));
    }
  }

  function renderStats() {
    setsEl.textContent = target ? `${game.setsFound}/${target}` : game.setsFound;
    deckEl.textContent = game.deck.length;
  }

  function renderBest() {
    const best = bestTime(mode.id);
    bestEl.textContent = best === null ? '—' : formatTime(best);
  }

  function renderTime() {
    timeEl.textContent = formatTime(clock.elapsed());
  }

  // Picks the column count and card orientation that make cards as large as
  // possible in the available space.
  function layout() {
    const W = wrap.clientWidth;
    const H = wrap.clientHeight;
    const n = game.board.length;
    if (!W || !H || !n) return;
    const gap = Math.round(Math.min(14, Math.max(6, Math.min(W, H) * 0.018)));

    // Cards that match the screen's orientation look more natural, so the
    // other orientation has to be clearly bigger to win.
    const natural = W > H ? 'landscape' : 'portrait';
    let best = null;
    for (const orient of ['portrait', 'landscape']) {
      const ratio = orient === 'portrait' ? CARD_RATIO : 1 / CARD_RATIO; // height / width
      const cap = orient === 'portrait' ? MAX_CARD_LONG_SIDE / ratio : MAX_CARD_LONG_SIDE;
      const bias = orient === natural ? 1.15 : 1;
      for (let cols = 1; cols <= n; cols++) {
        const rows = Math.ceil(n / cols);
        const w = Math.min(cap, (W - gap * (cols - 1)) / cols, (H - gap * (rows - 1)) / rows / ratio);
        const score = w * w * ratio * bias;
        if (w > 0 && (!best || score > best.score + 1)) {
          best = { orient, cols, w: Math.floor(w), h: Math.floor(w * ratio), score };
        }
      }
    }

    board.style.setProperty('--cols', best.cols);
    board.style.setProperty('--gap', `${gap}px`);
    board.style.setProperty('--card-w', `${best.w}px`);
    board.style.setProperty('--card-h', `${best.h}px`);
    if (best.orient !== orientation) {
      orientation = best.orient;
      for (const [id, el] of cards) el.innerHTML = cardSVG(id, orientation, design);
    }
  }

  // ---- Play ----------------------------------------------------------------

  function toggle(el) {
    if (busy || game.over) return;
    const id = Number(el.dataset.id);
    const at = selected.indexOf(id);
    if (at >= 0) selected.splice(at, 1);
    else selected.push(id);
    renderSelection();
    if (selected.length === 3) submit();
  }

  function submit() {
    const els = selected.map((id) => cards.get(id));
    const ok = game.claim(selected.map((id) => game.board.indexOf(id)));
    busy = true;

    if (ok) {
      recordSet();
      els.forEach((el) => el.classList.add('found'));
      announcer.textContent = `Set! ${game.setsFound} found.`;
      later(FOUND_MS, () => {
        selected = [];
        busy = false;
        renderBoard();
        if (game.over) finish();
      });
    } else {
      els.forEach((el) => el.classList.add('wrong'));
      announcer.textContent = 'Not a set.';
      later(WRONG_MS, () => {
        els.forEach((el) => el.classList.remove('wrong'));
        selected = [];
        busy = false;
        renderSelection();
      });
    }
  }

  function finish() {
    clock.pause();
    renderTime();
    const timeMs = Math.floor(clock.elapsed()); // floor, like the on-screen timer
    const cardsLeft = game.board.length + game.deck.length;
    const previousBest = bestTime(mode.id);
    recordGame({ mode: mode.id, timeMs, sets: game.setsFound, mistakes: game.mistakes, cardsLeft });
    renderBest();

    let bestLine = '';
    if (previousBest !== null && timeMs < previousBest) bestLine = '<p class="panel-best">New best time</p>';
    else if (previousBest !== null) bestLine = `<p class="panel-muted">Best ${formatTime(previousBest)}</p>`;

    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.innerHTML = `
      <div class="panel" role="dialog" aria-modal="true" aria-labelledby="end-title">
        <p class="panel-kicker">${target ? `${mode.name} complete` : 'No sets left'}</p>
        <h2 class="panel-title" id="end-title">${formatTime(timeMs)}</h2>
        ${bestLine}
        <dl class="results">
          <div><dt>Sets</dt><dd>${game.setsFound}</dd></div>
          ${target ? '' : `<div><dt>Cards left</dt><dd>${cardsLeft}</dd></div>`}
          <div><dt>Mistakes</dt><dd>${game.mistakes}</dd></div>
        </dl>
        <div class="panel-actions">
          <button class="btn" type="button" data-action="back">Menu</button>
          <button class="btn btn-primary" type="button" data-action="again">Play again</button>
        </div>
      </div>
    `;
    view.append(overlay);
    overlay.querySelector('[data-action="again"]').focus();
  }

  function newGame() {
    view.querySelector('.overlay')?.remove();
    for (const el of cards.values()) el.remove();
    cards.clear();
    selected = [];
    busy = false;
    game = new SetGame({ targetSets: target });
    clock.reset();
    renderTime();
    renderBest();
    renderBoard();
  }

  function later(ms, fn) {
    setTimeout(() => disposed || fn(), ms);
  }

  // ---- Events --------------------------------------------------------------

  // Select on pointerdown for snappy touch play; keyboard activation arrives
  // as a click with detail 0.
  board.addEventListener('pointerdown', (event) => {
    const el = event.button === 0 && event.target.closest('.card');
    if (el) toggle(el);
  });
  board.addEventListener('click', (event) => {
    const el = event.detail === 0 && event.target.closest('.card');
    if (el) toggle(el);
  });
  board.addEventListener('animationend', (event) => {
    if (event.animationName === 'deal') event.target.classList.remove('deal');
  });

  view.addEventListener('click', (event) => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'back') back();
    if (action === 'again') newGame();
  });

  const onKey = (event) => {
    if (event.key === 'Escape' && selected.length && !busy) {
      selected = [];
      renderSelection();
    }
  };
  const onVisibility = () => {
    if (document.hidden) clock.pause();
    else if (!game.over) clock.resume();
  };
  document.addEventListener('keydown', onKey);
  document.addEventListener('visibilitychange', onVisibility);

  const resizer = new ResizeObserver(layout);
  resizer.observe(wrap);
  // The timer shows hundredths, so it redraws every frame.
  let frame = requestAnimationFrame(function tick() {
    renderTime();
    frame = requestAnimationFrame(tick);
  });

  newGame();

  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    resizer.disconnect();
    document.removeEventListener('keydown', onKey);
    document.removeEventListener('visibilitychange', onVisibility);
  };
}

// A stopwatch that can pause while the app is in the background.
class Clock {
  constructor() {
    this.reset();
  }
  reset() {
    this.total = 0;
    this.since = performance.now();
  }
  elapsed() {
    return this.total + (this.since === null ? 0 : performance.now() - this.since);
  }
  pause() {
    if (this.since === null) return;
    this.total += performance.now() - this.since;
    this.since = null;
  }
  resume() {
    if (this.since === null) this.since = performance.now();
  }
}
