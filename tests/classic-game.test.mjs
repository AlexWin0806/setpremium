import { test } from 'node:test';
import assert from 'node:assert/strict';
import { attributes, findSet, isSet, newDeck, thirdCard } from '../js/set.js';
import { ClassicGame } from '../js/classic-game.js';

// Small deterministic PRNG so failures are reproducible.
function mulberry32(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const id = ({ number, color, shading, shape }) => number + color * 3 + shading * 9 + shape * 27;

test('attributes round-trip through ids', () => {
  for (let i = 0; i < 81; i++) assert.equal(id(attributes(i)), i);
});

test('isSet accepts all-same / all-different and rejects two-of-a-kind', () => {
  const a = id({ number: 0, color: 0, shading: 0, shape: 0 });
  const b = id({ number: 1, color: 0, shading: 1, shape: 2 });
  const c = id({ number: 2, color: 0, shading: 2, shape: 1 });
  assert.ok(isSet(a, b, c));
  const d = id({ number: 2, color: 1, shading: 2, shape: 1 });
  assert.ok(!isSet(a, b, d));
  assert.ok(!isSet(a, a, a));
});

test('thirdCard always completes a set', () => {
  for (let a = 0; a < 81; a++) {
    for (let b = 0; b < 81; b++) {
      if (a !== b) assert.ok(isSet(a, b, thirdCard(a, b)));
    }
  }
});

test('newDeck is a permutation of all 81 cards', () => {
  const deck = newDeck(mulberry32(1));
  assert.deepEqual([...deck].sort((x, y) => x - y), Array.from({ length: 81 }, (_, i) => i));
});

test('findSet returns valid indices or null', () => {
  const cards = [0, 1, 2];
  assert.deepEqual(findSet(cards), [0, 1, 2]);
  assert.equal(findSet([0, 1, 3]), null);
});

test('a classic game always ends with an empty deck and no set on the board', () => {
  for (let seed = 1; seed <= 300; seed++) {
    const rng = mulberry32(seed);
    const game = new ClassicGame({ rng });
    let turns = 0;
    while (!game.over) {
      const found = findSet(game.board);
      assert.ok(found, 'a set must exist while the game is not over');
      const before = game.board.filter((_, i) => !found.includes(i));
      assert.ok(game.claim(found));
      // Cards that were not claimed stay on the board.
      for (const card of before) assert.ok(game.board.includes(card));
      assert.ok(game.board.length % 3 === 0);
      assert.ok(++turns <= 27);
    }
    assert.equal(game.deck.length, 0);
    assert.equal(findSet(game.board), null);
    assert.equal(game.setsFound * 3 + game.board.length, 81);
    assert.equal(new Set(game.board).size, game.board.length);
  }
});

test('a wrong claim counts a mistake and leaves the board alone', () => {
  const game = new ClassicGame({ rng: mulberry32(7) });
  const board = [...game.board];
  let bad = null;
  for (let k = 2; k < board.length && !bad; k++) {
    if (!isSet(board[0], board[1], board[k])) bad = [0, 1, k];
  }
  assert.ok(bad);
  assert.equal(game.claim(bad), false);
  assert.equal(game.mistakes, 1);
  assert.deepEqual(game.board, board);
});
