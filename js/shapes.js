// Card shapes, centred on the origin, indexed by the card's `shape` attribute.
//
// Classic shapes are drawn horizontally in a 130 × 52 box and turn with the
// card. They use only M/L/C/Z so scripts/make-icons.mjs can rasterise them.
// Fruit stand upright in roughly a 64 × 64 box and never turn.

const DIAMOND = 'M -65 0 L 0 -26 L 65 0 L 0 26 Z';

const SQUIGGLE =
  'M -56 22 ' +
  'C -70 6 -60 -22 -36 -25 ' +
  'C -16 -27 0 -12 18 -15 ' +
  'C 34 -18 44 -30 56 -22 ' +
  'C 70 -6 60 22 36 25 ' +
  'C 16 27 0 12 -18 15 ' +
  'C -34 18 -44 30 -56 22 Z';

const OVAL =
  'M -39 -26 L 39 -26 C 53.36 -26 65 -14.36 65 0 C 65 14.36 53.36 26 39 26 ' +
  'L -39 26 C -53.36 26 -65 14.36 -65 0 C -65 -14.36 -53.36 -26 -39 -26 Z';

export const SHAPES = [DIAMOND, SQUIGGLE, OVAL];

// Fruit are sketched at a convenient size, then scaled (and turned) to fit
// the card. `transform` maps each [x, y] point of an M/L/C/Z path.
const round = (n) => Math.round(n * 100) / 100;
const transform = (d, fn) =>
  d.replace(/(-?\d*\.?\d+)\s+(-?\d*\.?\d+)/g, (_, x, y) => fn(+x, +y).map(round).join(' '));
const scaled = (d, k) => transform(d, (x, y) => [x * k, y * k]);

// Body with a dimple top and bottom, then the stem and a leaf.
const APPLE = scaled(
  'M 0 -16 ' +
    'C 8 -26 30 -26 30 -4 ' +
    'C 30 14 18 30 9 30 ' +
    'C 5 30 3 28 0 28 ' +
    'C -3 28 -5 30 -9 30 ' +
    'C -18 30 -30 14 -30 -4 ' +
    'C -30 -26 -8 -26 0 -16 Z ' +
    'M 0 -16 C 0 -22 1 -28 4 -32 ' +
    'M 4 -24 C 8 -33 17 -35 22 -32 C 18 -25 10 -22 4 -24 Z',
  1.2,
);

// A crescent, sketched lying down with the stem at the top right, then stood
// up a quarter turn counterclockwise (stem at the top left).
const BANANA = transform(
  'M -32 -10 ' +
    'C -28 24 20 30 30 -12 ' +
    'L 34 -20 L 29 -22 ' +
    'C 18 2 -14 4 -27 -12 ' +
    'C -29 -14 -32 -13 -32 -10 Z',
  (x, y) => [y * 1.2, -x * 1.2],
);

// A bunch of grapes in rows of 2, 3, 2, 1, packed like a honeycomb, drawn as
// just its outline: the outer arcs of the grapes round the edge, each running
// into the next where they overlap. Then a stem.
const GRAPE_K = 1.05;
const GRAPE_R = 11; // sketch units; more than half the step, so neighbours overlap
const GRAPE_STEP = 20; // centre to centre
const GRAPE_ROW_H = GRAPE_STEP * Math.sin(Math.PI / 3);
// The grapes round the edge, clockwise from the top left, as [column, row]
// with columns in half steps. The middle grape of row 1 is hidden inside.
const GRAPE_RING = [[-1, 0], [1, 0], [2, 1], [1, 2], [0, 3], [-1, 2], [-2, 1]].map(([c, r]) => [
  (c * GRAPE_STEP) / 2,
  -21.7 + r * GRAPE_ROW_H,
]);
// Where a grape's outline meets the next one's, on the outside of the bunch.
const grapeJoin = ([ax, ay], [bx, by]) => {
  const h = Math.sqrt(GRAPE_R ** 2 - (GRAPE_STEP / 2) ** 2) / GRAPE_STEP;
  return [(ax + bx) / 2 + (by - ay) * h, (ay + by) / 2 - (bx - ax) * h];
};
const GRAPE_OUTLINE = (() => {
  const n = GRAPE_RING.length;
  const joins = GRAPE_RING.map((c, i) => grapeJoin(c, GRAPE_RING[(i + 1) % n]));
  const pt = ([x, y]) => `${round(x * GRAPE_K)} ${round(y * GRAPE_K)}`;
  const r = round(GRAPE_R * GRAPE_K);
  const arcs = GRAPE_RING.map(([cx, cy], i) => {
    const [from, to] = [joins[(i + n - 1) % n], joins[i]];
    const turn = (Math.atan2(to[1] - cy, to[0] - cx) - Math.atan2(from[1] - cy, from[0] - cx) + 4 * Math.PI) % (2 * Math.PI);
    return `A ${r} ${r} 0 ${turn > Math.PI ? 1 : 0} 1 ${pt(to)}`;
  });
  return `M ${pt(joins[n - 1])} ${arcs.join(' ')} Z `;
})();
const GRAPES = GRAPE_OUTLINE + scaled('M 0 -26 C 0 -30 2 -34 6 -37', GRAPE_K);

export const FRUITS = [APPLE, BANANA, GRAPES];

// Cooldown treats, upright like the fruit and scaled to match them. Each is a
// single outline, blank inside.
const COOL_K = 1.1;

// A rounded ice pop with a bite out of its top right, on a stick.
const POPSICLE = scaled(
  'M -5 14 L -16 14 C -18.2 14 -20 12.2 -20 10 L -20 -14 ' +
    'C -20 -25 -11 -34 0 -34 C 4 -34 7.5 -33 10 -31.3 ' +
    'C 6.6 -27.4 12.5 -22.3 15.9 -26.2 C 11.2 -23.9 14.6 -16.9 19.3 -19.2 ' +
    'C 19.8 -17.6 20 -15.8 20 -14 L 20 10 C 20 12.2 18.2 14 16 14 L 5 14 ' +
    'L 5 31 C 5 34 3 36 0 36 C -3 36 -5 34 -5 31 Z',
  COOL_K,
);

// A scoop overhanging a cone.
const CONE = scaled(
  'M -23 -8 C -23 -20.7 -12.7 -31 0 -31 C 12.7 -31 23 -20.7 23 -8 ' +
    'C 23 -4.5 21 -2 18 -2 L 0 36 L -18 -2 C -21 -2 -23 -4.5 -23 -8 Z',
  COOL_K,
);

// A tumbler with a bendy straw coming out of the top.
const DRINK = scaled(
  'M -18 -10 L 3 -10 L 3 -24.5 L 13 -34.5 L 16.5 -31 L 8 -22.5 L 8 -10 L 18 -10 ' +
    'L 14.5 30 C 14.3 32.5 12.5 34 10 34 L -10 34 C -12.5 34 -14.3 32.5 -14.5 30 Z',
  COOL_K,
);

export const COOLDOWN = [POPSICLE, CONE, DRINK];
