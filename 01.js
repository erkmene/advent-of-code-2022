const fs = require("fs");

const data = fs
  .readFileSync("01.dat")
  .toString()
  .trim()
  .split("\n\n")
  .map((weights) => weights.split("\n").map((str) => parseInt(str)));

const sumTopGroupWeights = (data, count = 1) => {
  const sums = data.map((group) =>
    group.reduce((sum, current) => sum + current, 0)
  );
  sums.sort((a, b) => b - a);

  return sums.slice(0, count).reduce((sum, current) => sum + current, 0);
};

console.time("Time to first answer");
console.log("First Answer", sumTopGroupWeights(data));
console.timeEnd("Time to first answer");

console.time("Time to second answer");
console.log("Second Answer", sumTopGroupWeights(data, 3));
console.timeEnd("Time to second answer");
