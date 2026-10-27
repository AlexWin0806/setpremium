import { attributes } from './set.js';
import { FRUITS, SHAPES } from './shapes.js';

// Card geometry in SVG units, portrait. Landscape cards swap width and height
// and lay the shapes out side by side.
const W = 200;
const H = 300;

export const CARD_RATIO = H / W;

// Card designs. `upright` shapes keep their orientation on landscape cards;
// the others turn a quarter with the card, like the printed classic deck.
// `stripes` names the pattern used for striped shading (see installCardDefs).
export const CARD_DESIGNS = [
  {
    id: 'classic',
    name: 'Classic',
    shapes: SHAPES,
    nouns: [['diamond', 'diamonds'], ['squiggle', 'squiggles'], ['oval', 'ovals']],
    spacing: 76,
    upright: false,
    strokeWidth: 5,
    stripes: 'stripes',
    iconScale: 0.21,
  },
  {
    id: 'fruits',
    name: 'Fruits',
    shapes: FRUITS,
    nouns: [['apple', 'apples'], ['banana', 'bananas'], ['bunch of grapes', 'bunches of grapes']],
    spacing: 88,
    upright: true,
    strokeWidth: 3.5,
    stripes: 'stripes-diagonal',
    iconScale: 0.18,
  },
];

export function getDesign(id) {
  return CARD_DESIGNS.find((d) => d.id === id) ?? CARD_DESIGNS[0];
}

const NUMBERS = ['one', 'two', 'three'];
const COLORS = ['red', 'green', 'purple'];
const SHADINGS = ['solid', 'striped', 'outlined'];

// Makes symbols look engraved: a soft shadow inside their top edge and a thin
// light rim below them. `k` scales the offsets to the user units it's used in.
// Colours come from the theme's --engrave-* variables. Enabled per card
// texture in styles.css.
function engraveFilter(id, k) {
  return (
    `<filter id="${id}" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">` +
    '<feFlood style="flood-color:var(--engrave-shadow)"/>' +
    '<feComposite in2="SourceAlpha" operator="out"/>' +
    `<feOffset dy="${1.6 * k}"/>` +
    `<feGaussianBlur stdDeviation="${0.9 * k}"/>` +
    '<feComposite in2="SourceAlpha" operator="in" result="shadow"/>' +
    '<feFlood style="flood-color:var(--engrave-highlight)"/>' +
    '<feComposite in2="SourceAlpha" operator="in"/>' +
    `<feOffset dy="${1.6 * k}"/>` +
    '<feComposite in2="SourceAlpha" operator="out" result="rim"/>' +
    '<feMerge><feMergeNode in="rim"/><feMergeNode in="SourceGraphic"/><feMergeNode in="shadow"/></feMerge>' +
    '</filter>'
  );
}

// Stripe patterns and filters are shared by every card, so they live in one
// hidden SVG. Colours come from the theme's --set-color-N variables. `stripes`
// runs across the shape; `stripes-diagonal` leans from bottom left to top right.
export function installCardDefs() {
  if (document.getElementById('card-defs')) return;
  const pattern = (id, c, extra) =>
    `<pattern id="${id}-${c}" patternUnits="userSpaceOnUse" width="9" height="10"${extra}>` +
    `<rect width="3" height="10" style="fill:var(--set-color-${c})"/></pattern>`;
  const patterns = COLORS.map(
    (_, c) => pattern('stripes', c, '') + pattern('stripes-diagonal', c, ' patternTransform="rotate(45)"'),
  ).join('');
  // Cards are drawn in card units; design icons at about a fifth of that.
  const filters = engraveFilter('engrave', 1) + engraveFilter('engrave-icon', 0.22);
  document.body.insertAdjacentHTML(
    'afterbegin',
    `<svg id="card-defs" class="svg-defs" aria-hidden="true" focusable="false"><defs>${patterns}${filters}</defs></svg>`,
  );
}

export function cardSVG(id, orientation, design) {
  const { number, color, shading, shape } = attributes(id);
  const paint = `var(--set-color-${color})`;
  const fill = [paint, `url(#${design.stripes}-${color})`, 'none'][shading];
  const count = number + 1;
  const landscape = orientation === 'landscape';
  const [w, h] = landscape ? [H, W] : [W, H];
  const turn = landscape && !design.upright ? ' rotate(90)' : '';

  let paths = '';
  for (let i = 0; i < count; i++) {
    const offset = (i - (count - 1) / 2) * design.spacing;
    const [x, y] = landscape ? [w / 2 + offset, h / 2] : [w / 2, h / 2 + offset];
    paths +=
      `<path d="${design.shapes[shape]}" transform="translate(${x} ${y})${turn}" ` +
      `style="fill:${fill};stroke:${paint};stroke-width:${design.strokeWidth}"/>`;
  }
  // The group is unrotated, so effects on it (like engraving) light every
  // card from the same side.
  return `<svg viewBox="0 0 ${w} ${h}" aria-hidden="true"><g class="symbols">${paths}</g></svg>`;
}

export function describeCard(id, design) {
  const { number, color, shading, shape } = attributes(id);
  const noun = design.nouns[shape][number > 0 ? 1 : 0];
  return `${NUMBERS[number]} ${COLORS[color]} ${SHADINGS[shading]} ${noun}`;
}

// A design's three shapes side by side in the three card colours, standing
// upright. Used for the Classic mode tile and the design picker.
export function designIcon(design) {
  const turn = design.upright ? '' : 'rotate(90) ';
  return (
    '<svg viewBox="0 0 48 48" aria-hidden="true" class="design-icon">' +
    design.shapes
      .map(
        (d, i) =>
          `<g transform="translate(${24 + (i - 1) * 16} 24)"><g class="hop">` +
          `<path d="${d}" transform="${turn}scale(${design.iconScale})" ` +
          `style="fill:var(--set-color-${i});stroke:var(--set-color-${i})"/></g></g>`,
      )
      .join('') +
    '</svg>'
  );
}
