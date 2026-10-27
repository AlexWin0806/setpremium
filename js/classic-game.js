import { BOARD_SIZE, findSet, isSet, newDeck } from './set.js';

// Classic solo game: work through the whole deck until no set is left.
// Pure state, no DOM — the view in game-view.js drives it.
export class ClassicGame {
  constructor({ rng = Math.random } = {}) {
    this.deck = newDeck(rng);
    this.board = this.deck.splice(0, BOARD_SIZE);
    this.setsFound = 0;
    this.mistakes = 0;
    this.#fill();
  }

  get over() {
    return this.deck.length === 0 && findSet(this.board) === null;
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

    if (this.deck.length > 0 && this.board.length <= BOARD_SIZE) {
      for (const i of indices) this.board[i] = this.deck.shift();
    } else {
      this.#compact(indices);
    }
    this.#fill();
    return true;
  }

  // Deals extra cards while the board has no set.
  #fill() {
    while (this.deck.length > 0 && findSet(this.board) === null) {
      this.board.push(...this.deck.splice(0, 3));
    }
  }

  // Removes three cards, moving cards from the end of the board into the gaps
  // so the remaining cards keep their positions.
  #compact(indices) {
    const keep = this.board.length - 3;
    const holes = indices.filter((i) => i < keep).sort((x, y) => x - y);
    const movers = [];
    for (let i = keep; i < this.board.length; i++) {
      if (!indices.includes(i)) movers.push(i);
    }
    holes.forEach((hole, n) => (this.board[hole] = this.board[movers[n]]));
    this.board.length = keep;
  }
}
