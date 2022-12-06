const assert = require("assert");
const fs = require("fs");

const parseData = (file) => fs.readFileSync(file).toString().trim();

const testData = fs.readFileSync("06.test.dat").toString().trim().split("\n");

const findEndOfMarker = (str, markerLength = 4) => {
  for (let i = markerLength - 1; i < str.length; i++) {
    const prev = new Set(str.slice(i - markerLength + 1, i));
    if (prev.size === markerLength - 1) {
      const char = str.charAt(i);
      if (!prev.has(char)) {
        return i + 1;
      }
    }
  }
};

assert.equal(findEndOfMarker(testData[0]), 7);
assert.equal(findEndOfMarker(testData[1]), 5);
assert.equal(findEndOfMarker(testData[2]), 6);
assert.equal(findEndOfMarker(testData[3]), 10);
assert.equal(findEndOfMarker(testData[4]), 11);

assert.equal(findEndOfMarker(testData[0], 14), 19);
assert.equal(findEndOfMarker(testData[1], 14), 23);
assert.equal(findEndOfMarker(testData[2], 14), 23);
assert.equal(findEndOfMarker(testData[3], 14), 29);
assert.equal(findEndOfMarker(testData[4], 14), 26);

const data = parseData("06.dat");

console.time("Time to first answer");
console.log("First Answer", findEndOfMarker(data));
console.timeEnd("Time to first answer");

console.time("Time to second answer");
console.log("Second Answer", findEndOfMarker(data, 14));
console.timeEnd("Time to second answer");
