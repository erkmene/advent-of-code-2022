const assert = require("assert");
const fs = require("fs");

const manhattanDistance = (x1, y1, x2, y2) => {
  return Math.abs(x2 - x1) + Math.abs(y2 - y1);
};

class Tunnels {
  constructor(filename) {
    this.sensors = new Set();
    this.sHashes = new Set();
    this.bHashes = new Set();
    this.minCoords = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY];
    this.maxCoords = [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY];

    const regex =
      /Sensor at x=([\-0-9]*), y=([\-0-9]*): closest beacon is at x=([\-0-9]*), y=([\-0-9]*)/gm;

    fs.readFileSync(filename)
      .toString()
      .trim()
      .split("\n")
      .forEach((line) => {
        const matches = [...line.matchAll(regex)][0];
        this.addPair(
          parseInt(matches[1]),
          parseInt(matches[2]),
          parseInt(matches[3]),
          parseInt(matches[4])
        );
      });
  }

  findEdges(sensorX, sensorY, distance) {
    const d = distance + 1;
    let x, y;
    for (let i = 0; i < d + 1; i++) {
      x = d - i;
      y = i;
      this.edges.add({ x: sensorX + x, y: sensorY + y });
      this.edges.add({ x: sensorX - x, y: sensorY + y });
      this.edges.add({ x: sensorX + x, y: sensorY - y });
      this.edges.add({ x: sensorX - x, y: sensorY - y });
    }
    return this.edges;
  }

  addPair(sensorX, sensorY, beaconX, beaconY) {
    const distance = manhattanDistance(sensorX, sensorY, beaconX, beaconY);
    // this.findEdges(sensorX, sensorY, distance);

    this.sensors.add({ x: sensorX, y: sensorY, distance });
    this.sHashes.add(`${sensorX},${sensorY}`);
    this.bHashes.add(`${beaconX},${beaconY}`);
    this.minCoords = [
      Math.min(sensorX - distance, beaconX, this.minCoords[0]),
      Math.min(sensorY - distance, beaconY, this.minCoords[1]),
    ];
    this.maxCoords = [
      Math.max(beaconX, sensorX + distance, this.maxCoords[0]),
      Math.max(beaconY, sensorY + distance, this.maxCoords[1]),
    ];
  }

  findCoverage(row) {
    const filled = new Set();
    for (let i = this.minCoords[0]; i <= this.maxCoords[0]; i++) {
      if (
        !this.bHashes.has(`${i},${row}`) &&
        !this.sHashes.has(`${i},${row}`)
      ) {
        for (const sensor of this.sensors) {
          if (
            manhattanDistance(i, row, sensor.x, sensor.y) <= sensor.distance
          ) {
            filled.add([i, row]);
            break;
          }
        }
      }
    }
    return filled.size;
  }

  findBeacon(min, max) {
    for (const sensor of this.sensors) {
      const d = sensor.distance + 1;
      let x, y;
      for (let i = 0; i < d + 1; i++) {
        x = d - i;
        y = i;
        const edges = [
          { x: sensor.x + x, y: sensor.y + y },
          { x: sensor.x - x, y: sensor.y + y },
          { x: sensor.x + x, y: sensor.y - y },
          { x: sensor.x - x, y: sensor.y - y },
        ];

        for (const edge of edges) {
          if (edge.x < min || edge.y < min || edge.x > max || edge.y > max) {
            continue;
          }
          let collision = false;
          for (const sensor of this.sensors) {
            if (
              manhattanDistance(edge.x, edge.y, sensor.x, sensor.y) <=
              sensor.distance
            ) {
              collision = true;
              break;
            }
          }
          if (!collision) {
            return {
              x: edge.x,
              y: edge.y,
              tuningFrequency: edge.x * 4000000 + edge.y,
            };
          }
        }
      }
    }
  }
}

(() => {
  const tunnels = new Tunnels("15.test.dat");
  assert.equal(tunnels.findCoverage(9), 25);
  assert.equal(tunnels.findCoverage(10), 26);
  assert.equal(tunnels.findCoverage(11), 27);
  assert.equal(tunnels.findBeacon(0, 20).tuningFrequency, 56000011);
})();

const tunnels = new Tunnels("15.dat");

console.time("Time to first answer");
console.log("First Answer", tunnels.findCoverage(2000000));
console.timeEnd("Time to first answer");

console.time("Time to second answer");
console.log("Second Answer", tunnels.findBeacon(0, 4000000).tuningFrequency);
console.timeEnd("Time to second answer");
