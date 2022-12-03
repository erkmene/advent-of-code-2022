const assert = require("assert");
const fs = require("fs");

const parseData = (file) => fs.readFileSync(file).toString().trim().split("\n");

const data = parseData("03.dat");
const testData = parseData("03.test.dat");

const compartmentalize = (str) => {
  return [str.slice(0, str.length / 2), str.slice(str.length / 2)];
};

assert.deepEqual(compartmentalize(testData[0]), [
  "vJrwpWtwJgWr",
  "hcsFMMfFFhFp",
]);
assert.deepEqual(compartmentalize(testData[1]), [
  "jqHRNqRjqzjGDLGL",
  "rsFMfFZSrLrFZsSL",
]);

const findIntersection = (strArr) => {
  strArr.sort((a, b) => a.length - b.length);

  const int = new Set();
  const ref = strArr[0];
  const others = strArr.slice(1);

  for (let i = 0; i < ref.length; i++) {
    let count = 0;
    const test = ref[i];
    for (let j = 0; j < others.length; j++) {
      const other = others[j];
      if (other.includes(test)) {
        count++;
      }
    }
    if (count === strArr.length - 1) {
      int.add(test);
    }
  }

  return [...int];
};

assert.deepEqual(findIntersection(compartmentalize(testData[0])), ["p"]);
assert.deepEqual(findIntersection(compartmentalize(testData[1])), ["L"]);
assert.deepEqual(findIntersection(compartmentalize(testData[2])), ["P"]);

const calculatePriority = (char) => {
  const ascii = char.charCodeAt(0);
  let val = ascii;
  if (val >= 97) {
    val -= 96;
  } else {
    val -= 64 - 26;
  }
  return val;
};

assert.equal(calculatePriority("p"), 16);
assert.equal(calculatePriority("L"), 38);
assert.equal(calculatePriority("P"), 42);

const calculatePriorities = (chars) =>
  chars.reduce((sum, char) => sum + calculatePriority(char), 0);

assert.equal(calculatePriorities(["p", "L", "P"]), 16 + 38 + 42);

const sumPriorities = (sacks) =>
  sacks.reduce(
    (sum, sack) =>
      sum + calculatePriorities(findIntersection(compartmentalize(sack))),
    0
  );

assert.equal(sumPriorities(testData), 157);

const groupSacks = (data, count) =>
  data.reduce((groups, sack, index) => {
    if (index % count === 0) {
      groups.push([]);
    }
    groups[Math.floor(index / count)].push(sack);
    return groups;
  }, []);

assert.deepEqual(groupSacks(testData, 3), [
  [
    "vJrwpWtwJgWrhcsFMMfFFhFp",
    "jqHRNqRjqzjGDLGLrsFMfFZSrLrFZsSL",
    "PmmdzqPrVvPwwTWBwg",
  ],
  [
    "wMqvLMZHhHMvwLHjbvcjnnSBnvTQFn",
    "ttgJtRGJQctTZtZT",
    "CrZsJsPPZsGzwwsLwLmpwMDw",
  ],
]);

assert.deepEqual(findIntersection(groupSacks(testData, 3)[0]), ["r"]);
assert.deepEqual(findIntersection(groupSacks(testData, 3)[1]), ["Z"]);

const sumGroupPriorities = (sacks) =>
  groupSacks(sacks, 3).reduce(
    (sum, group) => sum + calculatePriorities(findIntersection(group)),
    0
  );

assert.equal(sumGroupPriorities(testData), 70);

console.time("Time to first answer");
console.log("First Answer", sumPriorities(data));
console.timeEnd("Time to first answer");

console.time("Time to second answer");
console.log("Second Answer", sumGroupPriorities(data));
console.timeEnd("Time to second answer");
