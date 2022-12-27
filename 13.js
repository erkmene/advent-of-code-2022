const assert = require("assert");
const fs = require("fs");

const parseData = (filename) =>
  fs
    .readFileSync(filename)
    .toString()
    .trim()
    .split("\n\n")
    .map((pair) => pair.split("\n").map((item) => JSON.parse(item)));

const log = (depth, ...rest) => {
  // console.log([...Array(depth)].map(() => "\t").join(""), ...rest);
};

const compare = (left, right, depth = 0) => {
  log(depth, "----");
  log(depth, "left", left, "right", right);

  if (left === undefined) {
    log(depth, "Left run out of items, 1");
    return 1;
  } else if (right === undefined) {
    log(depth, "Right run out of items, -1");
    return -1;
  }

  if (Array.isArray(left) && !Array.isArray(right)) {
    log(depth, "Convert right into array");
    [left, right] = [left, [right]];
  } else if (!Array.isArray(left) && Array.isArray(right)) {
    log(depth, "Convert left into array");
    [left, right] = [[left], right];
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    log(depth, "Both is array. Diving...");
    for (let i = 0; i < Math.max(left.length, right.length); i++) {
      const itemCheck = compare(left[i], right[i], depth + 1);
      if (itemCheck === 0) {
        continue;
      } else {
        return itemCheck;
      }
    }
  } else if (left < right) {
    log(depth, "Left is smaller, 1");
    return 1;
  } else if (right < left) {
    log(depth, "Right is smaller, -1");
    return -1;
  } else {
    log(depth, "Equal, continue");
    return 0;
  }

  return 0;
};

const checkPairs = (pairs) => {
  let sum = 0;
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i];
    const [left, right] = pair;
    const result = compare(left, right);
    log(0, "Result", result);
    if (result === 1) {
      sum += i + 1;
    }
  }
  return sum;
};

const findDecoderKey = (pairs) => {
  const flat = pairs.reduce(
    (acc, [left, right]) => {
      acc = [...acc, left, right];
      return acc;
    },
    [[[2]], [[6]]]
  );
  flat.sort((left, right) => compare(left, right) * -1);
  const strList = flat.map((item) => JSON.stringify(item));
  return (strList.indexOf("[[2]]") + 1) * (strList.indexOf("[[6]]") + 1);
};

(() => {
  // test scope
  const data = parseData("13.test.dat");
  assert.equal(checkPairs(data), 13);
  assert.equal(findDecoderKey(data), 140);
})();

const data = parseData("13.dat");

console.time("Time to first answer");
console.log("First Answer:", checkPairs(data));
console.timeEnd("Time to first answer");

console.time("Time to second answer");
console.log("Second Answer:", findDecoderKey(data));
console.timeEnd("Time to second answer");
