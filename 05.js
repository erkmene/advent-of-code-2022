const assert = require("assert");
const fs = require("fs");

const parseData = (file) => {
  let [setup, moves] = fs.readFileSync(file).toString().split("\n\n");

  setup = setup.split("\n");
  let colSize = setup[setup.length - 1].trim();
  colSize = parseInt(colSize[colSize.length - 1]);

  const dock = [...Array(colSize)].map(() => []);
  for (let y = 0; y < setup.length - 1; y++) {
    const row = setup[y];
    for (let x = 0; x < row.length; x += 4) {
      const crate = row[x + 1];
      if (crate != " ") {
        dock[x / 4].push(crate);
      }
    }
  }

  moves = moves
    .trim()
    .split("\n")
    .map((line) => {
      const parts = line.split(" ").map((p) => parseInt(p));
      return [parts[1], parts[3], parts[5]];
    });

  return { dock, moves };
};

const testData = parseData("05.test.dat");
assert.deepEqual(testData, {
  dock: [["N", "Z"], ["D", "C", "M"], ["P"]],
  moves: [
    [1, 2, 1],
    [3, 1, 3],
    [2, 2, 1],
    [1, 1, 2],
  ],
});

const run = (data, moveInOrder) => {
  const dock = [...data.dock];

  data.moves.forEach((move) => {
    const count = move[0];
    const from = move[1] - 1;
    const to = move[2] - 1;

    const hold = dock[from].slice(0, count);
    dock[from] = dock[from].slice(count);
    if (!moveInOrder) {
      hold.reverse();
    }
    dock[to] = hold.concat(dock[to]);
  });
  return dock;
};

assert.deepEqual(run(testData), [["C"], ["M"], ["Z", "N", "D", "P"]]);
assert.deepEqual(run(testData, true), [["M"], ["C"], ["D", "N", "Z", "P"]]);

const readTopAfterMoves = (data, moveInOrder) => {
  const dock = run(data, moveInOrder);
  return dock.map((col) => col[0]).join("");
};

assert.equal(readTopAfterMoves(testData), "CMZ");

const data = parseData("05.dat");

console.time("Time to first answer");
console.log("First Answer", readTopAfterMoves(data));
console.timeEnd("Time to first answer");

console.time("Time to second answer");
console.log("Second Answer", readTopAfterMoves(data, true));
console.timeEnd("Time to second answer");
