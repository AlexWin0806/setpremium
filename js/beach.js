// Home-screen art for the Beach theme: a bird's-eye view of the shoreline with
// waves washing in and out, and things on the sand. It's always in the page
// but only shown when the Beach theme is active (see styles.css), so it
// previews live from the settings drawer.

// The water's edge, left to right, in a 1200 × 200 box stretched to fit.
const EDGE =
  'M0 122 C60 132 110 118 170 114 C250 108 300 126 400 130 C500 134 560 110 660 120 ' +
  'C760 130 840 140 930 122 C1010 106 1100 128 1200 116';
const WATER = `${EDGE} L1200 -80 L0 -80 Z`;

function shore() {
  return `
    <div class="shore">
      <svg viewBox="0 0 1200 200" preserveAspectRatio="none">
        <defs>
          <linearGradient id="beach-water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#176b98"/>
            <stop offset="0.55" stop-color="#249fc0"/>
            <stop offset="0.86" stop-color="#5fd0d3"/>
            <stop offset="1" stop-color="#a6ece4"/>
          </linearGradient>
        </defs>
        <path class="wet" d="${WATER}" transform="translate(0 20)"/>
        <path class="swash" d="${WATER}" transform="translate(0 7)"/>
        <g class="water">
          <path d="${WATER}" fill="url(#beach-water)"/>
          <path class="foam-back" d="${EDGE}" transform="translate(0 -26)"/>
          <path class="foam" d="${EDGE}"/>
          <path class="bubbles" d="${EDGE}" transform="translate(0 7)"/>
        </g>
      </svg>
    </div>`;
}

// ---- Things on the sand (all drawn from above) -----------------------------

function umbrella() {
  const r = 46;
  const wedges = Array.from({ length: 8 }, (_, i) => {
    const a0 = (i / 8) * 2 * Math.PI;
    const a1 = ((i + 1) / 8) * 2 * Math.PI;
    const p = (a) => `${(r * Math.cos(a)).toFixed(2)} ${(r * Math.sin(a)).toFixed(2)}`;
    return `<path d="M0 0 L${p(a0)} A${r} ${r} 0 0 1 ${p(a1)} Z" fill="${i % 2 ? '#fff4e0' : '#ff6f61'}"/>`;
  }).join('');
  return `
    <svg class="deco deco-umbrella" viewBox="-56 -56 116 116">
      <circle cx="7" cy="7" r="${r}" fill="rgb(110 76 30 / 0.18)"/>
      ${wedges}
      <circle r="${r}" fill="none" stroke="rgb(0 0 0 / 0.08)" stroke-width="1.5"/>
      <circle r="4.5" fill="#e2574c"/>
    </svg>`;
}

function chair() {
  const slats = Array.from({ length: 10 }, (_, i) => `<path d="M6 ${10 + i * 8.5}h32"/>`).join('');
  return `
    <svg class="deco deco-chair" viewBox="0 0 48 104">
      <rect x="6" y="6" width="40" height="96" rx="7" fill="rgb(110 76 30 / 0.16)"/>
      <rect x="2" y="2" width="40" height="96" rx="7" fill="#fffdf8" stroke="#d6c19a" stroke-width="2"/>
      <g stroke="#e8dbc1" stroke-width="2">${slats}</g>
      <rect x="7" y="28" width="30" height="62" rx="3" fill="#37b3c4"/>
      <g fill="#ffd166"><rect x="7" y="40" width="30" height="7"/><rect x="7" y="60" width="30" height="7"/></g>
      <rect x="7" y="74" width="30" height="16" rx="3" fill="#fff4e0" opacity="0.9"/>
    </svg>`;
}

function castle() {
  const tower = (x, y) =>
    `<circle cx="${x}" cy="${y}" r="11" fill="#eecb8a" stroke="#c79b52" stroke-width="2.5"/>` +
    `<circle cx="${x}" cy="${y}" r="6.5" fill="none" stroke="#c79b52" stroke-width="2" stroke-dasharray="3 3"/>`;
  return `
    <svg class="deco deco-castle" viewBox="-62 -62 124 124">
      <rect x="-54" y="-54" width="108" height="108" rx="22" fill="none" stroke="#6fcfe0" stroke-width="10"/>
      <rect x="-54" y="-54" width="108" height="108" rx="22" fill="none" stroke="#a9e6ee" stroke-width="3"/>
      <rect x="-34" y="-34" width="68" height="68" rx="3" fill="rgb(110 76 30 / 0.15)" transform="translate(5 5)"/>
      <rect x="-34" y="-34" width="68" height="68" rx="3" fill="#e3bd78" stroke="#c79b52" stroke-width="2.5"/>
      <rect x="-27" y="-27" width="54" height="54" fill="none" stroke="#c79b52" stroke-width="3" stroke-dasharray="5 4"/>
      ${tower(-34, -34)}${tower(34, -34)}${tower(-34, 34)}${tower(34, 34)}
      <circle r="13" fill="#f0cf91" stroke="#c79b52" stroke-width="2.5"/>
      <path d="M0 0 L16 -5 L0 -10 Z" fill="#ff6f61"/>
      <circle r="2" fill="#8a6a3a"/>
    </svg>`;
}

function turtle() {
  const flipper = (x, y, angle, rx, ry, cls) =>
    `<g transform="translate(${x} ${y}) rotate(${angle})">` +
    `<ellipse class="${cls}" cx="${-rx + 2}" cy="0" rx="${rx}" ry="${ry}" fill="#86c98f" stroke="#4f8f5e" stroke-width="2"/></g>`;
  return `
    <svg class="deco deco-turtle" viewBox="-52 -62 104 124">
      <ellipse cx="5" cy="6" rx="27" ry="35" fill="rgb(110 76 30 / 0.16)"/>
      ${flipper(-18, -14, 30, 18, 7, 'flipper flipper-left')}
      <g transform="scale(-1 1)">${flipper(-18, -14, 30, 18, 7, 'flipper flipper-right')}</g>
      ${flipper(-16, 22, -30, 10, 5, '')}
      <g transform="scale(-1 1)">${flipper(-16, 22, -30, 10, 5, '')}</g>
      <path d="M-5 32 L0 44 L5 32 Z" fill="#86c98f" stroke="#4f8f5e" stroke-width="2" stroke-linejoin="round"/>
      <ellipse cy="-38" rx="9" ry="11" fill="#86c98f" stroke="#4f8f5e" stroke-width="2"/>
      <circle cx="-4" cy="-42" r="1.8" fill="#24402c"/><circle cx="4" cy="-42" r="1.8" fill="#24402c"/>
      <ellipse rx="24" ry="32" fill="#4f9a62" stroke="#3b7a4b" stroke-width="3"/>
      <g fill="#6dbb7f" stroke="#3b7a4b" stroke-width="1.5" stroke-linejoin="round">
        <polygon points="0,-22 9,-16 9,-6 0,0 -9,-6 -9,-16"/>
        <polygon points="0,0 9,6 9,16 0,22 -9,16 -9,6"/>
      </g>
      <g stroke="#3b7a4b" stroke-width="1.5">
        <path d="M9 -16 L20 -20 M9 -6 L23 -2 M9 6 L23 2 M9 16 L19 22"/>
        <path d="M-9 -16 L-20 -20 M-9 -6 L-23 -2 M-9 6 L-23 2 M-9 16 L-19 22"/>
      </g>
    </svg>`;
}

function starfish() {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 ? 15 : 38;
    return `${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`;
  }).join(' ');
  const dots = Array.from({ length: 5 }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    return [10, 18, 26]
      .map((r) => `<circle cx="${(r * Math.cos(a)).toFixed(2)}" cy="${(r * Math.sin(a)).toFixed(2)}" r="2.2"/>`)
      .join('');
  }).join('');
  return `
    <svg class="deco deco-star" viewBox="-50 -50 100 100">
      <polygon points="${pts}" transform="translate(4 4)" fill="rgb(110 76 30 / 0.16)" stroke="rgb(110 76 30 / 0.16)" stroke-width="9" stroke-linejoin="round"/>
      <polygon points="${pts}" fill="#ff9a4d" stroke="#ff9a4d" stroke-width="9" stroke-linejoin="round"/>
      <g fill="#ffd3a1">${dots}<circle r="4"/></g>
    </svg>`;
}

function spiral(cx, cy, r, fill, line) {
  return (
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${line}" stroke-width="2.5"/>` +
    `<path d="M${cx} ${cy} m-${r * 0.18} 0 a${r * 0.18} ${r * 0.18} 0 1 1 ${r * 0.36} 0 ` +
    `a${r * 0.36} ${r * 0.36} 0 1 1 -${r * 0.72} 0 a${r * 0.54} ${r * 0.54} 0 1 1 ${r * 1.08} 0 ` +
    `a${r * 0.72} ${r * 0.72} 0 1 1 -${r * 1.44} 0" fill="none" stroke="${line}" stroke-width="2"/>`
  );
}

function hermitCrab() {
  return `
    <svg class="deco deco-crab" viewBox="-50 -50 100 100">
      <g class="crab-legs" stroke="#e05a40" stroke-width="3" stroke-linecap="round">
        <path d="M-10 12 L-25 6 M-11 17 L-27 17 M-9 21 L-23 27"/>
        <path d="M10 12 L25 6 M11 17 L27 17 M9 21 L23 27"/>
      </g>
      <ellipse cy="18" rx="12" ry="8" fill="#f26b4f"/>
      <circle cx="-14" cy="27" r="7" fill="#f26b4f" stroke="#d64f37" stroke-width="1.5"/>
      <circle cx="12" cy="27" r="5" fill="#f26b4f" stroke="#d64f37" stroke-width="1.5"/>
      <path d="M-4 22 L-5 31 M4 22 L5 31" stroke="#d64f37" stroke-width="2" stroke-linecap="round"/>
      <circle cx="-5" cy="32" r="2.2" fill="#2b2b2b"/><circle cx="5" cy="32" r="2.2" fill="#2b2b2b"/>
      <circle cx="4" cy="-4" r="22" fill="rgb(110 76 30 / 0.16)"/>
      ${spiral(0, -8, 22, '#f6d5b3', '#d9a67c')}
    </svg>`;
}

function shells(cls) {
  const ribs = [-60, -35, -12, 12, 35, 60]
    .map((deg) => {
      const a = ((deg - 90) * Math.PI) / 180;
      return `M0 14 L${(24 * Math.cos(a)).toFixed(2)} ${(14 + 24 * Math.sin(a)).toFixed(2)}`;
    })
    .join(' ');
  return `
    <svg class="deco ${cls}" viewBox="-40 -30 80 60">
      <g transform="translate(-14 2) rotate(-20)">
        <path d="M0 14 L-22 0 A26 26 0 0 1 22 0 Z" fill="#f7b8a6" stroke="#e38e7b" stroke-width="2" stroke-linejoin="round"/>
        <path d="${ribs}" stroke="#e38e7b" stroke-width="1.5"/>
        <rect x="-5" y="12" width="10" height="5" rx="1.5" fill="#f7b8a6" stroke="#e38e7b" stroke-width="1.5"/>
      </g>
      ${spiral(18, 4, 11, '#f3e3c9', '#c9a77d')}
    </svg>`;
}

export function beachScene() {
  return `
    <div class="beach-scene" aria-hidden="true">
      ${shore()}
      ${turtle()}
      ${starfish()}
      ${shells('deco-shells-a')}
      ${chair()}
      ${umbrella()}
      ${hermitCrab()}
      ${shells('deco-shells-b')}
      ${castle()}
    </div>`;
}
