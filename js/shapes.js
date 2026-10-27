// Classic card shapes, drawn horizontally and centred on the origin inside a
// 130 × 52 box. Only M/L/C/Z commands are used so scripts/make-icons.mjs can
// rasterise the same paths.

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

// Indexed by the card's `shape` attribute.
export const SHAPES = [DIAMOND, SQUIGGLE, OVAL];
export const SHAPE_NAMES = ['diamond', 'squiggle', 'oval'];
