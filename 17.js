const assert = require("assert");
const fs = require("fs");

class Tetris {
  constructor(filename) {
    this.instructions = fs.readFileSync(filename).toString().trim().split("");
    this.pieces = [
      {
        name: "-",
        shape: [
          [3, 0],
          [2, 0],
          [1, 0],
          [0, 0],
        ],
      },
      {
        name: "+",
        shape: [
          [1, 2],
          [0, 1],
          [1, 1],
          [2, 1],
          [1, 0],
        ],
      },
      {
        name: "⅃",
        shape: [
          [2, 2],
          [2, 1],
          [0, 0],
          [1, 0],
          [2, 0],
        ],
      },
      {
        name: "|",
        shape: [
          [0, 3],
          [0, 2],
          [0, 1],
          [0, 0],
        ],
      },
      {
        name: "□",
        shape: [
          [1, 1],
          [0, 1],
          [1, 0],
          [0, 0],
        ],
      },
    ];

    this.floor = 0;
    this.width = 7;
  }

  drawGrid(grid, topY, p) {
    p = new Set(p.map((c) => c.toString()));
    let str = "";
    for (let y = topY + 5; y > Math.max(-1, topY - 20); y--) {
      str += y + "\t";
      for (let x = 0; x < this.width; x++) {
        if (p.has([x, y].toString())) {
          str += "@";
        } else if (grid.has([x, y].toString())) {
          str += "#";
        } else {
          str += ".";
        }
      }
      str += "\n";
    }
    return str;
  }

  playUntilPieceStop({
    count,
    topY,
    turn,
    instructionIndex,
    pieceIndex,
    newPieceCount,
    piece,
    p,
  }) {
    piece = piece || null;
    p = p || null;
    turn = turn || 0;
    instructionIndex = instructionIndex || 0;
    pieceIndex = pieceIndex || 0;
    topY = topY || 0;
    newPieceCount = newPieceCount || 0;

    let grid = new Set();
    let prevTopY = 0;

    while (newPieceCount < count + 1) {
      if (!piece) {
        piece = this.pieces[pieceIndex];
        p = piece.shape.map((c) => [c[0] + 2, c[1] + topY + 3]);
        turn = 0;
        newPieceCount++;
        // Used this for interpolation
        // console.log(newPieceCount + "\t" + topY + "\t" + (topY - prevTopY));
        prevTopY = topY;
      }

      if (turn % 2 === 0) {
        const dir = this.instructions[instructionIndex] === ">" ? 1 : -1;
        const newP = p.map((c) => [c[0] + dir, c[1]]);
        if (
          !newP.reduce((acc, c) => {
            return (
              acc || c[0] >= this.width || c[0] < 0 || grid.has(c.toString())
            );
          }, false)
        ) {
          p = newP;
        }
        instructionIndex = (instructionIndex + 1) % this.instructions.length;
      } else {
        const newP = p.map((c) => [c[0], c[1] - 1]);
        if (
          newP.reduce((acc, c) => {
            return acc || grid.has(c.toString()) || c[1] < 0;
          }, false)
        ) {
          grid = new Set([...grid, ...p.map((c) => c.toString())]);
          topY = Math.max(topY, ...p.map((c) => c[1] + 1));
          pieceIndex = (pieceIndex + 1) % this.pieces.length;
          piece = p = null;
        } else {
          p = newP;
        }
      }

      turn++;
    }

    return { count, topY, turn, instructionIndex, pieceIndex, newPieceCount };
  }

  interpolate(targetCount, stableStart, periodCount) {
    // When I plotted this in Excel, I realized that the system stabilizes for
    // the test input at about 40-50th round (don't have to be exact, just need
    // to find a pattern) and then has a period of 35. With the real data it's
    // bigger. The system stabilizes around 305 and then has a period of 1745.

    const stable = this.playUntilPieceStop({ count: stableStart });

    const period = this.playUntilPieceStop({
      count: stableStart + periodCount,
    });

    const periodDiff = period.topY - stable.topY;

    const periodInTarget = Math.floor(
      (targetCount - stableStart) / periodCount
    );

    const remainingPieces =
      targetCount - (stableStart + periodInTarget * periodCount);

    const remainingHeight =
      this.playUntilPieceStop({ count: stableStart + remainingPieces }).topY -
      stable.topY;

    return stable.topY + periodDiff * periodInTarget + remainingHeight;
  }
}

(() => {
  const tetris = new Tetris("17.test.dat");
  assert.equal(tetris.playUntilPieceStop({ count: 2022 }).topY, 3068);
  assert.equal(tetris.interpolate(2022, 55, 35), 3068);
})();

const tetris = new Tetris("17.dat");
console.log(tetris.playUntilPieceStop({ count: 2022 }).topY);
assert(tetris.playUntilPieceStop({ count: 2022 }).topY, 3193);
assert(tetris.interpolate(2022, 305, 1745), 3193);

console.log(tetris.interpolate(1000000000000, 305, 1745));
