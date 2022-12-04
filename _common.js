const assert = require("assert");

const findIntersection = (arrays) => {
  arrays.sort((a, b) => a.length - b.length);

  const int = new Set();
  const ref = arrays[0];
  const others = arrays.slice(1);

  for (let i = 0; i < ref.length; i++) {
    let count = 0;
    const test = ref[i];
    for (let j = 0; j < others.length; j++) {
      const other = others[j];
      if (other.includes(test)) {
        count++;
      }
    }
    if (count === arrays.length - 1) {
      int.add(test);
    }
  }

  return [...int];
};

assert.deepEqual(findIntersection(["abc", "bcde", "cefg"]), ["c"]);
assert.deepEqual(
  findIntersection(["abc".split(""), "bcde".split(""), "cefg".split("")]),
  ["c"]
);

module.exports = {
  findIntersection,
};
