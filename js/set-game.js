import { BOARD_SIZE, findAllSets, findSet, isSet, newDeck } from './set.js';

// With this many cards or fewer left in the deck, the dealer looks ahead to the
// end of the deck so the game doesn't get stuck before it runs out.
const LOOKAHEAD_DECK = 9;

// Solo game state shared by the game modes. Pure state, no DOM — the view in
// game-view.js drives it.
//
// The table never grows past 12 cards. Instead of always dealing the top of
// the deck, the dealer picks replacement cards so the table has a set
// (favouring cards nearest the top, so play still feels random). Near the end
// of the deck it also avoids picks that would leave no way to keep a set on
// the table. If no choice of cards can make a set, the game ends with those
// cards left in the deck.
//
// With `targetSets`, the game ends as soon as that many sets are found.
export class SetGame {
  constructor({ rng = Math.random, targetSets = null } = {}) {
    this.deck = newDeck(rng);
    this.board = [];
    this.targetSets = targetSets;
    this.setsFound = 0;
    this.mistakes = 0;
    this.stuck = false;
    this.#deal([]);
  }

  get over() {
    if (this.targetSets !== null && this.setsFound >= this.targetSets) return true;
    return findSet(this.board) === null;
  }

  // Attempts to claim the cards at three board indices. Returns true if they
  // formed a set (and the board was updated), false otherwise.
  claim(indices) {
    const [a, b, c] = indices.map((i) => this.board[i]);
    if (!isSet(a, b, c)) {
      this.mistakes++;
      return false;
    }
    this.setsFound++;
    this.#deal(indices);
    return true;
  }

  // Fills the given board slots (or, at the start, the whole board) from the
  // deck. Once the deck is empty the board shrinks instead.
  #deal(slots) {
    const kept = this.board.filter((_, i) => !slots.includes(i));
    const needed = BOARD_SIZE - kept.length;
    const picks = this.deck.length ? this.#pick(kept, needed) : null;

    if (!picks) {
      if (this.deck.length) this.stuck = true;
      this.#compact(slots);
      return;
    }
    const cards = picks.map((i) => this.deck[i]);
    this.deck = this.deck.filter((_, i) => !picks.includes(i));
    if (slots.length) slots.forEach((slot, n) => (this.board[slot] = cards[n]));
    else this.board = cards;
  }

  // Deck indices of `count` cards that give `kept` a set, trying combinations
  // in order so the top of the deck is used whenever it works.
  #pick(kept, count) {
    const lookahead = this.deck.length <= LOOKAHEAD_DECK;
    let fallback = null;
    for (const combo of combinations(this.deck.length, Math.min(count, this.deck.length))) {
      const board = [...kept, ...combo.map((i) => this.deck[i])];
      if (!findSet(board)) continue;
      if (!lookahead) return combo;
      fallback ??= combo;
      if (canFinish(board, this.deck.filter((_, i) => !combo.includes(i)))) return combo;
    }
    return fallback;
  }

  // Removes the cards in `slots`, moving cards from the end of the board into
  // the gaps so the remaining cards keep their positions.
  #compact(slots) {
    const keep = this.board.length - slots.length;
    const holes = slots.filter((i) => i < keep).sort((x, y) => x - y);
    const movers = [];
    for (let i = keep; i < this.board.length; i++) {
      if (!slots.includes(i)) movers.push(i);
    }
    holes.forEach((hole, n) => (this.board[hole] = this.board[movers[n]]));
    this.board.length = keep;
  }
}

// Whether, whichever set the player takes from `board`, the dealer can keep a
// set on the table until `deck` runs out.
function canFinish(board, deck) {
  if (deck.length === 0) return true;
  return findAllSets(board).every((set) => {
    const kept = board.filter((_, i) => !set.includes(i));
    for (const combo of combinations(deck.length, 3)) {
      const next = [...kept, ...combo.map((i) => deck[i])];
      if (findSet(next) && canFinish(next, deck.filter((_, i) => !combo.includes(i)))) return true;
    }
    return false;
  });
}

// Index combinations of size k from 0..n-1, in lexicographic order.
function* combinations(n, k) {
  const combo = Array.from({ length: k }, (_, i) => i);
  while (true) {
    yield [...combo];
    let i = k - 1;
    while (i >= 0 && combo[i] === n - k + i) i--;
    if (i < 0) return;
    combo[i]++;
    for (let j = i + 1; j < k; j++) combo[j] = combo[j - 1] + 1;
  }
}
