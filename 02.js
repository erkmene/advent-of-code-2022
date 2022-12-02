const assert = require("assert");
const fs = require("fs");

const shapeMap = {
  A: 0, // rock
  B: 1, // paper
  C: 2, // scissors
  X: 0, // rock || lose
  Y: 1, // paper || draw
  Z: 2, // scissors || win
};

const parseData = (file) =>
  fs
    .readFileSync(file)
    .toString()
    .trim()
    .split("\n")
    .map((round) => round.split(" ").map((shape) => shapeMap[shape]));

const data = parseData("02.dat");
const testData = parseData("02.test.dat");

const scoreMatrix = [
  [3, 6, 0],
  [0, 3, 6],
  [6, 0, 3],
];

const calculateRoundScore = (round, withResult) => {
  const opponent = round[0];
  let own, result;

  if (!withResult) {
    own = round[1];
    result = scoreMatrix[opponent][own];
  } else {
    result = round[1] * 3;
    own = scoreMatrix[opponent].indexOf(result);
  }

  const score = own + 1 + result;
  return score;
};

assert.equal(calculateRoundScore(testData[0]), 8);
assert.equal(calculateRoundScore(testData[1]), 1);
assert.equal(calculateRoundScore(testData[2]), 6);
assert.equal(calculateRoundScore(testData[0], true), 4);
assert.equal(calculateRoundScore(testData[1], true), 1);
assert.equal(calculateRoundScore(testData[2], true), 7);

const calculateGameScore = (rounds, withResult) =>
  rounds.reduce(
    (sum, round) => sum + calculateRoundScore(round, withResult),
    0
  );

assert.equal(calculateGameScore(testData), 15);
assert.equal(calculateGameScore(testData, true), 12);

console.time("Time to first answer");
console.log("First Answer", calculateGameScore(data));
console.timeEnd("Time to first answer");

console.time("Time to second answer");
console.log("Second Answer", calculateGameScore(data, true));
console.timeEnd("Time to second answer");
