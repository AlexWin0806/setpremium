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

// Eight grapes in rows of 2, 3, 2, 1, packed like a honeycomb, with a stem.
const GRAPE_K = 1.05;
const GRAPE_R = round(8.5 * GRAPE_K);
const GRAPE_STEP = 20; // centre to centre, sketch units (leaves a small gap)
const GRAPE_ROWS = [2, 3, 2, 1];
const grape = (x, y) =>
  `M ${round(x * GRAPE_K - GRAPE_R)} ${round(y * GRAPE_K)} ` +
  `a ${GRAPE_R} ${GRAPE_R} 0 1 0 ${round(2 * GRAPE_R)} 0 a ${GRAPE_R} ${GRAPE_R} 0 1 0 ${round(-2 * GRAPE_R)} 0 Z `;
const GRAPES =
  GRAPE_ROWS.flatMap((count, row) =>
    Array.from({ length: count }, (_, i) =>
      grape((i - (count - 1) / 2) * GRAPE_STEP, -21.7 + row * GRAPE_STEP * Math.sin(Math.PI / 3)),
    ),
  ).join('') + scaled('M 0 -26 C 0 -30 2 -34 6 -37', GRAPE_K);

export const FRUITS = [APPLE, BANANA, GRAPES];
