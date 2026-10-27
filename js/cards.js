import { attributes } from './set.js';
import { SHAPES, SHAPE_NAMES } from './shapes.js';

// Card geometry in SVG units, portrait. Landscape cards are the same drawing
// rotated a quarter turn.
const W = 200;
const H = 300;
const SPACING = 76;

export const CARD_RATIO = H / W;

const NUMBERS = ['one', 'two', 'three'];
const COLORS = ['red', 'green', 'purple'];
const SHADINGS = ['solid', 'striped', 'outlined'];

// Stripe patterns are shared by every card, so they live in one hidden SVG.
// Colours come from the theme's --set-color-N variables.
export function installCardDefs() {
  if (document.getElementById('card-defs')) return;
  const patterns = COLORS.map(
    (_, c) =>
      `<pattern id="stripes-${c}" patternUnits="userSpaceOnUse" width="9" height="10">` +
      `<rect width="3" height="10" style="fill:var(--set-color-${c})"/></pattern>`,
  ).join('');
  document.body.insertAdjacentHTML(
    'afterbegin',
    `<svg id="card-defs" class="svg-defs" aria-hidden="true" focusable="false"><defs>${patterns}</defs></svg>`,
  );
}

export function cardSVG(id, orientation = 'portrait') {
  const { number, color, shading, shape } = attributes(id);
  const paint = `var(--set-color-${color})`;
  const fill = [paint, `url(#stripes-${color})`, 'none'][shading];
  const count = number + 1;

  let paths = '';
  for (let i = 0; i < count; i++) {
    const y = H / 2 + (i - (count - 1) / 2) * SPACING;
    paths += `<path d="${SHAPES[shape]}" transform="translate(${W / 2} ${y})" style="fill:${fill};stroke:${paint}"/>`;
  }

  const landscape = orientation === 'landscape';
  const viewBox = landscape ? `0 0 ${H} ${W}` : `0 0 ${W} ${H}`;
  const turn = landscape ? ` transform="translate(${H} 0) rotate(90)"` : '';
  return `<svg viewBox="${viewBox}" aria-hidden="true"><g${turn}>${paths}</g></svg>`;
}

export function describeCard(id) {
  const { number, color, shading, shape } = attributes(id);
  const noun = SHAPE_NAMES[shape] + (number > 0 ? 's' : '');
  return `${NUMBERS[number]} ${COLORS[color]} ${SHADINGS[shading]} ${noun}`;
}
