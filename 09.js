const assert = require("assert");
const fs = require("fs");

const parseData = (file) =>
  fs
    .readFileSync(file)
    .toString()
    .trim()
    .split("\n")
    .map((line) =>
      line.split(" ").map((char, index) => {
        if (index === 1) {
          return parseInt(char);
        } else {
          return char;
        }
      })
    );

const move = (disp, knots) => {
  for (let i = 0; i < knots.length - 1; i++) {
    let head = knots[i];
    let tail = knots[i + 1];

    if (i === 0) {
      head[0] += disp[0];
      head[1] += disp[1];
    }

    const dist = [head[0] - tail[0], head[1] - tail[1]];

    if (Math.abs(dist[0]) > 1 || Math.abs(dist[1]) > 1) {
      tail[0] += Math.sign(dist[0]);
      tail[1] += Math.sign(dist[1]);
    }
  }

  return knots;
};

const runCommand = (command, knots) => {
  const [dir, count] = command;

  const tailVisited = new Set();
  tailVisited.add(knots[knots.length - 1].toString());

  const displacement = {
    U: [0, -1],
    R: [1, 0],
    D: [0, 1],
    L: [-1, 0],
  }[dir];

  for (let c = 0; c < count; c++) {
    knots = move(displacement, knots);
    tailVisited.add(knots[knots.length - 1].toString());
  }

  return { knots, tailVisited };
};

const runCommands = (commands, knots) => {
  let tailTally = new Set();
  commands.forEach((command) => {
    ({ knots, tailVisited } = runCommand(command, knots));
    tailTally = new Set([...tailTally, ...tailVisited]);
  });
  return { knots, tailVisited: tailTally };
};

const createKnots = (size) => [...Array(size)].map(() => [0, 0]);

const runCommandsWithKnotSize = (commands, knotSize) => {
  const knots = createKnots(knotSize);
  return runCommands(commands, knots);
};

(() => {
  // Test Scope

  let knots = [
    [0, 0],
    [0, 0],
  ];

  knots = runCommand(["D", 2], knots).knots;
  assert.deepEqual(knots, [
    [0, 2],
    [0, 1],
  ]);

  knots = runCommand(["R", 2], knots).knots;
  assert.deepEqual(knots, [
    [2, 2],
    [1, 2],
  ]);

  knots = runCommand(["U", 2], knots).knots;
  assert.deepEqual(knots, [
    [2, 0],
    [2, 1],
  ]);

  const testData = parseData("09.test.dat");
  knots = [
    [0, 0],
    [0, 0],
  ];
  let knotsAndTails = runCommands(testData, knots);
  assert.deepEqual(knotsAndTails, {
    knots: [
      [2, -2],
      [1, -2],
    ],
    tailVisited: new Set([
      "0,0",
      "1,0",
      "2,0",
      "3,0",
      "4,-1",
      "4,-2",
      "4,-3",
      "3,-2",
      "3,-3",
      "2,-2",
      "1,-2",
      "3,-4",
      "2,-4",
    ]),
  });

  assert.deepEqual(runCommandsWithKnotSize(testData, 2), knotsAndTails);

  knots = createKnots(10);
  knots = runCommand(["R", 5], knots).knots;
  assert.deepEqual(knots, [
    [5, 0],
    [4, 0],
    [3, 0],
    [2, 0],
    [1, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
  ]);

  knots = createKnots(10);
  knotsAndTails = runCommands(testData, knots);
  assert.deepEqual(knotsAndTails, {
    knots: [
      [2, -2],
      [1, -2],
      [2, -2],
      [3, -2],
      [2, -2],
      [1, -1],
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 0],
    ],
    tailVisited: new Set(["0,0"]),
  });
})();

const data = parseData("09.dat");

console.time("Time to first answer");
console.log("First Answer", runCommandsWithKnotSize(data, 2).tailVisited.size);
console.timeEnd("Time to first answer");

console.time("Time to second answer");
console.log(
  "Second Answer",
  runCommandsWithKnotSize(data, 10).tailVisited.size
);
console.timeEnd("Time to second answer");
