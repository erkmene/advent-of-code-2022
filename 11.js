const assert = require("assert");
const fs = require("fs");

class Monkey {
  constructor(def, office, userIsExtremelyWorried) {
    const lines = def.split("\n").map((line) => line.trim());
    this.id = parseInt(lines[0].split(" ")[1]);
    this.items = lines[1]
      .split(": ")[1]
      .split(", ")
      .map((n) => BigInt(n));
    const [, , , , operator, operand] = lines[2].split(" ");
    this.operator = operator;
    this.operand = operand;
    this.divTest = BigInt(lines[3].split("by ")[1]);
    this.divTestTrue = parseInt(lines[4].split("monkey ")[1]);
    this.divTestFalse = parseInt(lines[5].split("monkey ")[1]);
    this.inspectionCount = 0;
    this.office = office;
    this.userIsExtremelyWorried = userIsExtremelyWorried;
  }

  inspectItems() {
    while (this.items.length > 0) {
      const item = this.items.shift();
      this.inspectItem(item);
    }
  }

  inspectItem(item) {
    item = this.operateOn(item);
    if (!this.userIsExtremelyWorried) {
      item = item / BigInt(3);
    }
    const target = this.testItem(item);
    this.office.sendItem(item % this.office.commonDivisor, target);
    this.inspectionCount++;
  }

  testItem(item) {
    if (item % this.divTest === BigInt(0)) {
      return this.divTestTrue;
    } else {
      return this.divTestFalse;
    }
  }

  operateOn(item) {
    const operand = this.operand === "old" ? item : BigInt(this.operand);
    switch (this.operator) {
      case "+":
        item += operand;
        break;
      case "*":
        item *= operand;
        break;
    }
    return item;
  }

  receiveItem(item) {
    this.items.push(item);
  }
}

class Office {
  constructor(monkeyDefs, userIsExtremelyWorried) {
    this.monkeys = [];
    monkeyDefs.forEach((def) => {
      this.monkeys.push(new Monkey(def, this, userIsExtremelyWorried));
    });
    this.commonDivisor = this.monkeys.reduce(
      (acc, monkey) => acc * monkey.divTest,
      BigInt(1)
    );
  }

  sendItem(item, target) {
    this.monkeys[target].receiveItem(item);
  }

  workForRounds(count) {
    for (let i = 0; i < count; i++) {
      for (let m = 0; m < this.monkeys.length; m++) {
        const monkey = this.monkeys[m];
        monkey.inspectItems();
      }
    }

    const monkeysOfTheMonth = [...this.monkeys];
    monkeysOfTheMonth.sort((a, b) => b.inspectionCount - a.inspectionCount);
    return (
      monkeysOfTheMonth[0].inspectionCount *
      monkeysOfTheMonth[1].inspectionCount
    );
  }
}

const parseData = (file) =>
  fs.readFileSync(file).toString().trim().split("\n\n");

(() => {
  // test scope
  const testData = parseData("11.test.dat");
  let office = new Office(testData);
  assert.equal(office.workForRounds(20), 10605);

  office = new Office(testData, true);
  assert.equal(office.workForRounds(10000), 2713310158);
})();

let office = new Office(parseData("11.dat"));

console.time("Time to first answer");
const firstAnswer = office.workForRounds(20);
console.log("First Answer", firstAnswer);
console.timeEnd("Time to first answer");
assert.equal(firstAnswer, 110264);

office = new Office(parseData("11.dat"), true);

console.time("Time to second answer");
const secondAnswer = office.workForRounds(10000);
console.log("Second Answer", secondAnswer);
console.timeEnd("Time to second answer");
