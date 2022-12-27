const assert = require("assert");
const fs = require("fs");

const parseData = (file) =>
  fs
    .readFileSync(file)
    .toString()
    .trim()
    .split("\n")
    .map((line) => line.split(""));

const hashCoord = (x, y) => `${x},${y}`;

const createGraph = (mapArray) => {
  let start, end;
  const graph = {};

  const rows = mapArray.length;
  const cols = mapArray[0].length;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const nodeHash = hashCoord(x, y);

      let weight = mapArray[y][x];
      if (weight === "S") {
        start = nodeHash;
        weight = "a";
      } else if (weight === "E") {
        end = nodeHash;
        weight = "z";
      }
      weight = "abcdefghijklmnopqrstuvwxyz".indexOf(weight) + 1;

      const neighbors = [];
      for (let dir = 0; dir < 4; dir++) {
        const [nx, ny] = [
          [x + 0, y + -1],
          [x + 1, y + 0],
          [x + 0, y + 1],
          [x + -1, y + 0],
        ][dir];
        if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) {
          neighbors.push(hashCoord(nx, ny));
        }
      }

      graph[nodeHash] = {
        weight,
        neighbors,
      };
    }
  }

  return { start, end, graph };
};

const localDijkstra = (graph, start, end) => {
  const visited = [];
  let unvisited = [start];
  const distances = { [start]: { from: null, cost: 0 } };

  let current;

  while ((current = unvisited.shift())) {
    const neighbors = graph[current].neighbors.filter(
      (h) =>
        !visited.includes(h) &&
        // This is the special case for this problem.
        graph[h].weight - graph[current].weight < 2
    );

    unvisited.push(...neighbors);
    const costToCurrent = distances[current].cost;

    for (const nHash of neighbors) {
      const neighbor = graph[nHash];

      const newCost = costToCurrent + neighbor.weight;
      const prevCost = distances[nHash]?.cost;

      if (!prevCost || newCost < prevCost) {
        distances[nHash] = { from: current, cost: newCost };
      }
    }

    visited.push(current);
    unvisited = unvisited.filter((h) => !visited.includes(h));
  }

  return distances;
};

const tracePath = (distances, start, end) => {
  const path = [end];
  current = end;

  while (current !== start) {
    current = distances[current].from;
    path.unshift(current);
  }

  return path;
};

const findSuitableStartNodes = (graph) => {
  const result = [];
  for (node in graph) {
    if (graph[node].weight === 1) {
      for (neighbor of graph[node].neighbors) {
        if (graph[neighbor].weight === 2) {
          result.push(node);
          break;
        }
      }
    }
  }
  return result;
};

const findStepsFromShortestStartNode = (graph, end) => {
  const startNodes = findSuitableStartNodes(graph);
  let min = Infinity;
  for (start of startNodes) {
    const distances = localDijkstra(graph, start, end);
    const path = tracePath(distances, start, end);
    const steps = path.length - 1;
    min = Math.min(min, steps);
  }
  return min;
};

(() => {
  // test scope
  const testData = parseData("12.test.dat");
  const nodeGraph = createGraph(testData);
  const distances = localDijkstra(
    nodeGraph.graph,
    nodeGraph.start,
    nodeGraph.end
  );
  assert.equal(tracePath(distances, nodeGraph.start, nodeGraph.end).length, 32);
  assert.equal(
    findStepsFromShortestStartNode(nodeGraph.graph, nodeGraph.end),
    29
  );
})();

const data = parseData("12.dat");

console.time("Time to first answer");
const nodeGraph = createGraph(data);
const distances = localDijkstra(
  nodeGraph.graph,
  nodeGraph.start,
  nodeGraph.end
);

console.log(
  "First Answer:",
  tracePath(distances, nodeGraph.start, nodeGraph.end).length - 1
);
console.timeEnd("Time to first answer");

console.time("Time to second answer");

console.log(
  "Second Answer:",
  findStepsFromShortestStartNode(nodeGraph.graph, nodeGraph.end)
);
console.timeEnd("Time to second answer");
