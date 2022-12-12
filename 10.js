const assert = require("assert");
const fs = require("fs");

const parseData = (file) =>
  fs
    .readFileSync(file)
    .toString()
    .trim()
    .split("\n")
    .map((line) => line.split(" "));

class CPU {
  constructor() {
    this.x = 1;
    this.cycle = 0;
    this.history = [];

    this.V_COLS = 40;
    this.V_ROWS = 6;

    this.video = [...Array(this.V_COLS * this.V_ROWS)].map(() => " ");
  }

  run(program) {
    while (program.length > 0) {
      const command = program.shift();
      if (command[0] === "noop") {
        this.commit();
      } else if (command[0] === "addx") {
        this.commit();
        this.commit();
        this.x += parseInt(command[1]);
      }
    }
  }

  commit() {
    this.writeToVideo();
    this.history[this.cycle] = this.x;
    this.cycle++;
  }

  writeToVideo() {
    const col = this.cycle % this.V_COLS;
    const row = Math.floor(this.cycle / this.V_COLS) % this.V_ROWS;
    if (col >= this.x - 1 && col <= this.x + 1) {
      this.video[this.cycle % this.video.length] = "#";
    } else {
      this.video[this.cycle % this.video.length] = ".";
    }
  }

  getHistoryAtCycle(cycle) {
    return this.history[cycle - 1];
  }

  getSignalStrengthAtCycle(cycle) {
    return this.getHistoryAtCycle(cycle) * cycle;
  }

  sumSignalStrengths(cycles) {
    let sum = 0;
    while (cycles.length > 0) {
      const cycle = cycles.shift();
      sum += this.getSignalStrengthAtCycle(cycle);
    }
    return sum;
  }

  dumpVideo() {
    let screen = "";
    for (let i = 0; i < this.video.length; i++) {
      screen += this.video[i];
      if (i > 0 && (i + 1) % this.V_COLS === 0) {
        screen += "\n";
      }
    }
    return screen;
  }
}

(() => {
  const testData = parseData("10.test.dat");
  const cpu = new CPU();
  cpu.run(testData);

  assert.equal(cpu.getHistoryAtCycle(20), 21);
  assert.equal(cpu.getSignalStrengthAtCycle(20), 420);
  assert.equal(cpu.getSignalStrengthAtCycle(220), 3960);

  assert.equal(cpu.sumSignalStrengths([20, 60, 100, 140, 180, 220]), 13140);

  assert.equal(
    cpu.dumpVideo(),
    "##..##..##..##..##..##..##..##..##..##..\n###...###...###...###...###...###...###.\n####....####....####....####....####....\n#####.....#####.....#####.....#####.....\n######......######......######......####\n#######.......#######.......#######.....\n"
  );
})();

const data = parseData("10.dat");
const cpu = new CPU();
cpu.run(data);

console.time("Time to first answer");
console.log(
  "First Answer",
  cpu.sumSignalStrengths([20, 60, 100, 140, 180, 220])
);
console.timeEnd("Time to first answer");
assert.equal(cpu.sumSignalStrengths([20, 60, 100, 140, 180, 220]), 14220);

console.time("Time to second answer");
console.log("Second Answer:");
console.log(cpu.dumpVideo());
console.timeEnd("Time to second answer");
