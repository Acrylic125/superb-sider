// [row][col]
const PieceType = {
  empty: [],
  block: [[1]],
  horizontal_2: [[1, 1]],
  vertical_2: [[1], [1]],
  end_piece: [
    [1, 1],
    [1, 1],
  ],
  meme: [[1], [1, 1], [1]],
};

/** @type {Map<number, { startPos: number, type: keyof PieceType }>} */
const pieces = new Map();

var idCounter = 0;
const EMPTY_PTR = idCounter++;

// rows, cols
const BoardDimensions = [5, 4];
/** @type {number[]} */
const board = new Array(BoardDimensions[0] * BoardDimensions[1]).fill(EMPTY_PTR);

/**
 *
 * @param {number} row
 * @param {number} col
 * @returns
 */
function toPos(row, col) {
  return row * BoardDimensions[1] + col;
}

/**
 *
 * @param {number} row
 * @param {number} col
 * @returns
 */
function isPosOutOfBounds(row, col) {
  return row < 0 || col < 0 || row >= BoardDimensions[0] || col >= BoardDimensions[1];
}

function toRowCol(pos) {
  return [Math.floor(pos / BoardDimensions[1]), pos % BoardDimensions[1]];
}

function showBoard() {
  const rows = [];
  for (let r = 0; r < BoardDimensions[0]; r++) {
    const row = [];
    for (let c = 0; c < BoardDimensions[1]; c++) {
      const id = board[toPos(r, c)];
      if (id === EMPTY_PTR) {
        row.push("0");
      } else {
        row.push(id);
      }
    }
    rows.push(row.join(" "));
  }
  console.log(rows.join("\n"));
}

/**
 *
 * @param {keyof PieceType} type
 * @param {[number, number]} pos [row, col]
 */
function placeBlock(type, pos) {
  const pieceDimension = PieceType[type];
  const [row, col] = pos;

  const id = idCounter++;
  pieces.set(id, { startPos: toPos(pos[0], pos[1]), type });

  for (let r = 0; r < pieceDimension.length; r++) {
    for (let c = 0; c < pieceDimension[r].length; c++) {
      if (pieceDimension[r][c] === 1) {
        const pos = toPos(row + r, col + c);
        if (board[pos] !== EMPTY_PTR) {
          throw new Error(`Cannot place block at ${pos}`);
        }
        board[pos] = id;
      }
    }
  }
}

function removeBlock(id) {
  const piece = pieces.get(id);
  if (!piece) {
    throw new Error(`No piece with id ${id}`);
  }
  const [row, col] = toRowCol(piece.startPos);
  const pieceDimension = PieceType[piece.type];
  for (let r = 0; r < pieceDimension.length; r++) {
    for (let c = 0; c < pieceDimension[r].length; c++) {
      if (pieceDimension[r][c] === 1) {
        const pos = toPos(row + r, col + c);
        if (board[pos] !== id) {
          throw new Error(`Cannot remove block at ${pos}`);
        }
        board[pos] = EMPTY_PTR;
      }
    }
  }
}

/**
 *
 * @param {number[][]} pieceDimension
 * @param {[number, number]} from [row, col]
 * @param {[number, number]} direction Row, col deltas by 1
 */
function canMove(pieceDimension, from, direction) {
  const [row, col] = from;
  const [rowDelta, colDelta] = direction;

  if (rowDelta !== 0) {
    // rowDelta < 0 means LEFT
    if (rowDelta < 0) {
      // check if the first column is empty
      for (let r = 0; r < pieceDimension.length; r++) {
        const firstBlockIndexOnRow = pieceDimension[r].findIndex((block) => block === 1);
        const [checkRow, checkCol] = [row + r, col + firstBlockIndexOnRow - 1];
        if (isPosOutOfBounds(checkRow, checkCol)) {
          return false;
        }
        const pos = toPos(checkRow, checkCol);
        if (board[pos] !== EMPTY_PTR) {
          return false;
        }
      }
    }

    // rowDelta > 0 means RIGHT
    if (rowDelta > 0) {
      // check if the last column is empty
      for (let r = 0; r < pieceDimension.length; r++) {
        const lastBlockIndexOnRow = pieceDimension[r].length - 1;
        const [checkRow, checkCol] = [row + r, col + lastBlockIndexOnRow + 1];
        if (isPosOutOfBounds(checkRow, checkCol)) {
          return false;
        }
        const pos = toPos(checkRow, checkCol);
        if (board[pos] !== EMPTY_PTR) {
          return false;
        }
      }
    }
  }

  if (colDelta !== 0) {
    const totalCols = Math.max(...pieceDimension.map((row) => row.length));
    // colDelta < 0 means UP
    if (colDelta < 0) {
      for (let c = 0; c < totalCols; c++) {
        let firstBlockIndexOnCol = -1;
        for (let r = 0; r < pieceDimension.length; r++) {
          if (pieceDimension[r][c] === 1) {
            firstBlockIndexOnCol = r;
            break;
          }
        }

        if (firstBlockIndexOnCol === -1) {
          continue;
        }

        const [checkRow, checkCol] = [row + firstBlockIndexOnCol - 1, col + c];
        if (isPosOutOfBounds(checkRow, checkCol)) {
          return false;
        }
        const pos = toPos(checkRow, checkCol);
        if (board[pos] !== EMPTY_PTR) {
          return false;
        }
      }
    }
    // colDelta > 0 means DOWN
    if (colDelta > 0) {
      for (let c = 0; c < totalCols; c++) {
        let firstBlockIndexOnCol = -1;
        for (let r = pieceDimension.length - 1; r >= 0; r--) {
          if (pieceDimension[r][c] === 1) {
            firstBlockIndexOnCol = r;
            break;
          }
        }

        if (firstBlockIndexOnCol === -1) {
          continue;
        }

        const [checkRow, checkCol] = [row + firstBlockIndexOnCol + 1, col + c];
        if (isPosOutOfBounds(checkRow, checkCol)) {
          return false;
        }
        const pos = toPos(checkRow, checkCol);
        if (board[pos] !== EMPTY_PTR) {
          return false;
        }
      }
    }
  }

  return true;
}

/**
 *
 * @param {number} id
 * @param {[number, number]} direction Row, col deltas by 1
 */
function shiftBlock(id, direction) {
  const piece = pieces.get(id);
  if (!piece) {
    throw new Error(`No piece with id ${id}`);
  }
  const [row, col] = toRowCol(piece.startPos);
  const pieceDimension = PieceType[piece.type];
}

function shuffleBoard() {}

placeBlock("horizontal_2", [3, 2]);
placeBlock("meme", [1, 0]);
// placeBlock("end_piece", [1, 1]);
console.log(canMove(PieceType["meme"], [1, 0], [1, 0]));
// removeBlock(1);

showBoard();
