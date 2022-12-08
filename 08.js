const assert = require("assert");
const fs = require("fs");

class Grid {
  constructor(file) {
    const contents = fs.readFileSync(file).toString().trim();

    this.map = contents
      .split("\n")
      .map((row) => row.split("").map((cell) => parseInt(cell)));
    this.rowSize = this.map.length;
    this.colSize = this.map[0].length;
    this.surveyMemo = {};
  }

  cellAt(x, y) {
    return this.map[y][x];
  }

  getSurveyMemoForDirection(x, y, xIncrement, yIncrement) {
    return this.surveyMemo[`${x}|${y}|${xIncrement}|${yIncrement}`];
  }

  setSurveyMemoForDirection(x, y, xIncrement, yIncrement, value) {
    this.surveyMemo[`${x}|${y}|${xIncrement}|${yIncrement}`] = value;
  }

  surveyInDirection(startX, startY, xIncrement, yIncrement) {
    const memoized = this.getSurveyMemoForDirection(
      startX,
      startY,
      xIncrement,
      yIncrement
    );
    if (memoized) {
      return memoized;
    }

    let max = Number.MIN_SAFE_INTEGER;
    const reference = this.cellAt(startX, startY);
    let x = startX + xIncrement;
    let y = startY + yIncrement;
    let unbounded = false;
    let occluded = false;
    let countUntilOcclusion = 0;

    while (y >= 0 && y < this.rowSize && x >= 0 && x < this.colSize) {
      const newMax = Math.max(max, this.cellAt(x, y));

      if (newMax >= reference) {
        if (!occluded) {
          countUntilOcclusion++;
        }
        occluded = true;
      }

      if (!occluded) {
        countUntilOcclusion++;
      }
      max = Math.max(max, this.cellAt(x, y));
      x += xIncrement;
      y += yIncrement;
    }

    if (!occluded) {
      unbounded = true;
    }

    max = Math.max(reference, max);

    const result = {
      countUntilOcclusion,
      max,
      unbounded,
    };

    this.setSurveyMemoForDirection(
      startX,
      startY,
      xIncrement,
      yIncrement,
      result
    );

    return result;
  }

  findVisibleTrees() {
    let visible = [];

    for (let y = 0; y >= 0 && y < this.rowSize; y++) {
      for (let x = 0; x >= 0 && x < this.colSize; x++) {
        let localMax = false;
        for (let i = 0; i < 4; i++) {
          const xIncrement = [-1, 1, 0, 0][i];
          const yIncrement = [0, 0, -1, 1][i];
          const survey = this.surveyInDirection(x, y, xIncrement, yIncrement);
          if (survey.unbounded) {
            localMax = true;
            break;
          }
        }
        if (localMax) {
          visible.push([x, y, this.cellAt(x, y)]);
        }
      }
    }

    return visible;
  }

  getCellScenicScore(x, y) {
    let score = 1;
    for (let i = 0; i < 4; i++) {
      const xIncrement = [-1, 1, 0, 0][i];
      const yIncrement = [0, 0, -1, 1][i];
      const survey = this.surveyInDirection(x, y, xIncrement, yIncrement);
      score *= survey.countUntilOcclusion;
    }
    return score;
  }

  getMaxScenicScore() {
    let max = Number.MIN_SAFE_INTEGER;
    for (let y = 0; y >= 0 && y < this.rowSize; y++) {
      for (let x = 0; x >= 0 && x < this.colSize; x++) {
        max = Math.max(this.getCellScenicScore(x, y), max);
      }
    }
    return max;
  }
}

(() => {
  // Test Scope

  const grid = new Grid("08.test.dat");

  assert.equal(grid.rowSize, 5);
  assert.equal(grid.colSize, 5);
  assert.equal(grid.cellAt(1, 0), 0);
  assert.equal(grid.cellAt(4, 3), 9);

  assert.equal(grid.surveyInDirection(0, 0, 1, 0).max, 7);
  assert.equal(grid.surveyInDirection(4, 2, 0, 1).max, 9);
  assert.equal(grid.surveyInDirection(4, 2, 0, -1).max, 3);

  assert.equal(grid.surveyInDirection(0, 0, 1, 0).unbounded, false);
  assert.equal(grid.surveyInDirection(4, 3, 0, 1).unbounded, true);
  assert.equal(grid.surveyInDirection(4, 3, 0, -1).unbounded, true);

  assert.equal(grid.surveyInDirection(0, 0, 1, 0).unbounded, false);
  assert.equal(grid.surveyInDirection(4, 3, 0, 1).unbounded, true);
  assert.equal(grid.surveyInDirection(4, 3, 0, -1).unbounded, true);

  assert.equal(grid.findVisibleTrees().length, 21);

  assert.equal(grid.getCellScenicScore(2, 1), 4);
  assert.equal(grid.getCellScenicScore(2, 3), 8);

  assert.equal(grid.getMaxScenicScore(), 8);
})();

const grid = new Grid("08.dat");

console.time("Time to first answer");
console.log("First Answer", grid.findVisibleTrees().length);
console.timeEnd("Time to first answer");

console.time("Time to second answer");
console.log("Second Answer", grid.getMaxScenicScore());
console.timeEnd("Time to second answer");
