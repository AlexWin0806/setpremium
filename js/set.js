// Core SET rules. A card is an integer id in [0, 81); its four attributes are
// the base-3 digits of the id, so every attribute value is 0, 1 or 2.

export const DECK_SIZE = 81;
export const BOARD_SIZE = 12;

const PLACES = [1, 3, 9, 27];

export function attributes(id) {
  return {
    number: id % 3,
    color: Math.floor(id / 3) % 3,
    shading: Math.floor(id / 9) % 3,
    shape: Math.floor(id / 27) % 3,
  };
}

// Three cards form a set when, for every attribute, the values are all equal
// or all different — equivalently, when each attribute sums to 0 mod 3.
export function isSet(a, b, c) {
  if (a === b || b === c || a === c) return false;
  return PLACES.every((p) => (digit(a, p) + digit(b, p) + digit(c, p)) % 3 === 0);
}

// The unique card that completes a set with a and b.
export function thirdCard(a, b) {
  return PLACES.reduce((id, p) => id + ((6 - digit(a, p) - digit(b, p)) % 3) * p, 0);
}

// Returns the board indices of one set, or null if the board has none.
export function findSet(cards) {
  const index = new Map(cards.map((id, i) => [id, i]));
  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      const k = index.get(thirdCard(cards[i], cards[j]));
      if (k > j) return [i, j, k];
    }
  }
  return null;
}

export function shuffle(items, rng = Math.random) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function newDeck(rng = Math.random) {
  return shuffle(Array.from({ length: DECK_SIZE }, (_, i) => i), rng);
}

function digit(id, place) {
  return Math.floor(id / place) % 3;
}
