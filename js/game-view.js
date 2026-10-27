import { ClassicGame } from './classic-game.js';
import { CARD_RATIO, cardSVG, describeCard } from './cards.js';
import { ICONS } from './icons.js';
import { back } from './router.js';
import { bestTime, recordGame } from './stats.js';

const MODE = 'classic';
const MAX_CARD_LONG_SIDE = 340; // px, so cards don't get silly on big screens
const DEAL_STAGGER_MS = 45;
const FOUND_MS = 280;
const WRONG_MS = 380;

export function mountGame(root) {
  const view = document.createElement('div');
  view.className = 'view game';
  view.innerHTML = `
    <header class="game-bar">
      <button class="icon-btn" type="button" data-action="back" aria-label="Back to menu">${ICONS.back}</button>
      <div class="game-stats">
        <div class="stat"><span class="stat-value" data-stat="time">0:00</span><span class="stat-label">Time</span></div>
        <div class="stat"><span class="stat-value" data-stat="sets">0</span><span class="stat-label">Sets</span></div>
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
  const announcer = view.querySelector('[data-announce]');

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
    el.setAttribute('aria-label', describeCard(id));
    el.setAttribute('aria-pressed', 'false');
    el.innerHTML = cardSVG(id, orientation);
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
    setsEl.textContent = game.setsFound;
    deckEl.textContent = game.deck.length;
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
      for (const [id, el] of cards) el.innerHTML = cardSVG(id, orientation);
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
    const timeMs = Math.round(clock.elapsed());
    const previousBest = bestTime(MODE);
    recordGame({
      mode: MODE,
      timeMs,
      sets: game.setsFound,
      mistakes: game.mistakes,
      cardsLeft: game.board.length,
    });

    let bestLine = '';
    if (previousBest !== null && timeMs < previousBest) bestLine = '<p class="panel-best">New best time</p>';
    else if (previousBest !== null) bestLine = `<p class="panel-muted">Best ${formatTime(previousBest)}</p>`;

    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.innerHTML = `
      <div class="panel" role="dialog" aria-modal="true" aria-labelledby="end-title">
        <p class="panel-kicker">No sets left</p>
        <h2 class="panel-title" id="end-title">${formatTime(timeMs)}</h2>
        ${bestLine}
        <dl class="results">
          <div><dt>Sets</dt><dd>${game.setsFound}</dd></div>
          <div><dt>Cards left</dt><dd>${game.board.length}</dd></div>
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
    game = new ClassicGame();
    clock.reset();
    renderTime();
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
  const ticker = setInterval(renderTime, 250);

  newGame();

  return () => {
    disposed = true;
    clearInterval(ticker);
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

function formatTime(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}
