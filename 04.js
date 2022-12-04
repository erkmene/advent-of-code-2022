const assert = require("assert");
const fs = require("fs");
const { findIntersection } = require("./_common");

const parseData = (file) =>
  fs
    .readFileSync(file)
    .toString()
    .trim()
    .split("\n")
    .map((line) =>
      line.split(",").map((assignment) => {
        const [start, end] = assignment.split("-").map((str) => parseInt(str));
        return [...Array(end - start + 1)].map((_, i) => start + i);
      })
    );

const data = parseData("04.dat");
const testData = parseData("04.test.dat");

const findIntersectionAndSubsetCounts = (testData) => {
  let intersectionCount = 0;
  let subsetCount = 0;
  testData.forEach((tuple) => {
    tuple.sort((a, b) => a.length - b.length);
    const intersections = findIntersection(tuple);
    if (intersections.length > 0) {
      intersectionCount++;
      if (intersections.length === tuple[0].length) {
        subsetCount++;
      }
    }
  });
  return { intersectionCount, subsetCount };
};

const testResult = findIntersectionAndSubsetCounts(testData);
assert.deepEqual(testResult.subsetCount, 2);
assert.deepEqual(testResult.intersectionCount, 4);

const result = findIntersectionAndSubsetCounts(data);

console.time("Time to both answers");
console.log("First Answer", result.subsetCount);
console.log("Second Answer", result.intersectionCount);
console.timeEnd("Time to both answers");
