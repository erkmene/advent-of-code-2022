const assert = require("assert");
const fs = require("fs");

class V {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  sub(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  static sub(v1, v2) {
    return new V(v1.x - v2.x, v1.y - v2.y);
  }

  static add(v1, v2) {
    return new V(v1.x + v2.x, v1.y + v2.y);
  }

  mag() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  toString() {
    return `[${this.x},${this.y}]`;
  }

  clone() {
    return new V(this.x, this.y);
  }
}

class Reservoir {
  constructor(filename) {
    this.instructions = fs
      .readFileSync(filename)
      .toString()
      .trim()
      .split("\n")
      .map((line) =>
        line
          .split(" -> ")
          .map((coord) => new V(...coord.split(",").map((n) => parseInt(n))))
      );

    this.objects = {
      rock: new Set(),
      sand: new Set(),
    };
    this.minCoords = new V(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
    this.maxCoords = new V(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);
    this.initMap();
  }

  initMap() {
    this.instructions.forEach((line) => {
      let prevV = line[0];
      this.addObject("rock", prevV);
      line.forEach((v) => {
        const diff = V.sub(v, prevV);
        const mag = diff.mag();
        let newVec = prevV.clone();
        for (let i = 0; i < mag; i++) {
          newVec = V.add(new V(Math.sign(diff.x), Math.sign(diff.y)), newVec);
          this.addObject("rock", newVec);
        }
        prevV = v;
      });
    });
  }

  addObject(type, v) {
    this.objects[type].add(v.toString());
    this.minCoords = new V(
      Math.min(this.minCoords.x, v.x),
      Math.min(this.minCoords.y, v.y)
    );
    if (type === "rock") {
      this.maxCoords = new V(
        Math.max(this.maxCoords.x, v.x),
        Math.max(this.maxCoords.y, v.y)
      );
    }
  }

  checkBarrier(v, withBottom) {
    return (
      (withBottom && v.y === this.maxCoords.y + 2) ||
      this.objects.rock.has(v.toString()) ||
      this.objects.sand.has(v.toString())
    );
  }

  dropSand(withBottom = false, x = 500, y = 0) {
    let sv = new V(x, y);
    let origin = new V(x, y);
    while (
      (!withBottom && sv.y <= this.maxCoords.y) ||
      (withBottom && !this.checkBarrier(origin))
    ) {
      const d = V.add(sv, new V(0, 1));
      const dl = V.add(sv, new V(-1, 1));
      const dr = V.add(sv, new V(1, 1));
      if (this.checkBarrier(d, withBottom)) {
        if (this.checkBarrier(dl, withBottom)) {
          if (this.checkBarrier(dr, withBottom)) {
            this.addObject("sand", sv);
            return false;
          } else {
            sv = dr;
          }
        } else {
          sv = dl;
        }
      } else {
        sv = d;
      }
    }
    return true;
  }

  dropSands(withBottom) {
    let check;
    while (!check) {
      check = this.dropSand(withBottom);
    }
    return this.objects.sand.size;
  }
}

(() => {
  const res = new Reservoir("14.test.dat");
  assert.equal(res.dropSands(), 24);
  assert.equal(res.dropSands(true), 93);
})();

const res = new Reservoir("14.dat");

console.time("Time to first answer");
console.log("First Answer", res.dropSands());
console.timeEnd("Time to first answer");

assert.equal(res.dropSands(), 768);

console.time("Time to second answer");
console.log("Second Answer", res.dropSands(true));
console.timeEnd("Time to second answer");
