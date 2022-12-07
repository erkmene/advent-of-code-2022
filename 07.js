const assert = require("assert");
const fs = require("fs");

class Directory {
  constructor(name) {
    this.name = name;
    this.dirs = [];
    this.files = [];
    this.fileSize = 0;
    this.totalSize = 0;
    this.parent = null;
  }

  addDirectory(name) {
    const newDir = new Directory(name);
    newDir.parent = this;
    this.dirs.push(newDir);
    return newDir;
  }

  addFile(name, size) {
    this.files.push({ name, size });
    this.fileSize += size;
    this.totalSize += size;
    let parent = this.parent;
    while (parent) {
      parent.totalSize += size;
      parent = parent.parent;
    }
  }

  getDirectory(name) {
    return this.dirs.filter((dir) => dir.name === name)[0];
  }
}

const parseData = (file) => fs.readFileSync(file).toString().trim().split("\n");

const parseDump = (lines) => {
  const root = new Directory("/");
  let currentDir = root;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("$")) {
      const [_, command, dir] = line.split(" ");
      if (command === "cd") {
        if (dir === "/") {
          currentDir = root;
        } else if (dir === "..") {
          currentDir = currentDir.parent;
        } else {
          currentDir = currentDir.getDirectory(dir);
        }
      }
    } else {
      const tuple = line.split(" ");
      if (tuple[0] === "dir") {
        currentDir.addDirectory(tuple[1]);
      } else {
        currentDir.addFile(tuple[1], parseInt(tuple[0]));
      }
    }
  }

  return root;
};

const filterDirs = (dirs, filterFunc) => {
  if (!Array.isArray(dirs)) {
    dirs = [dirs];
  }

  const { dirList, sum } = dirs.reduce(
    (acc, dir) => {
      if (filterFunc(dir)) {
        acc.dirList.push(dir);
        acc.sum += dir.totalSize;
      }
      if (dir.dirs.length > 0) {
        const child = filterDirs(dir.dirs, filterFunc);
        acc.dirList = acc.dirList.concat(child.dirList);
        acc.sum += child.sum;
      }
      return acc;
    },
    { dirList: [], sum: 0 }
  );

  return { dirList, sum };
};

const ifLess = (limit) => (dir) => dir.totalSize < limit;
const sumIfLess = (tree, limit) => filterDirs(tree, ifLess(limit));
const ifEqualOrGreater = (limit) => (dir) => dir.totalSize >= limit;
const sumIfEqualOrGreater = (tree, limit) =>
  filterDirs(tree, ifEqualOrGreater(limit));

const chooseFolder = (tree, totalSpace = 70000000, targetSpace = 30000000) => {
  const currentFreeSpace = totalSpace - tree.totalSize;
  const remainingTarget = targetSpace - currentFreeSpace;

  const candidates = sumIfEqualOrGreater(tree, remainingTarget).dirList;
  candidates.sort((a, b) => a.totalSize - b.totalSize);

  return candidates[0];
};

(() => {
  const dir = new Directory("/");
  dir.addFile("test1", 1000);
  const subDir = dir.addDirectory("sub");
  subDir.addFile("test2", 10000);
  assert.equal(dir.fileSize, 1000);
  assert.equal(dir.totalSize, 11000);
  assert.equal(subDir.fileSize, 10000);
  assert.equal(subDir.totalSize, 10000);
  assert.equal(dir.getDirectory("sub").name, "sub");
  assert.equal(dir.getDirectory("sub").parent.name, "/");

  const testData = parseData("07.test.dat");

  const tree = parseDump(testData);
  assert.equal(tree.getDirectory("a").getDirectory("e").fileSize, 584);
  assert.equal(tree.getDirectory("a").fileSize, 29116 + 2557 + 62596);
  assert.equal(tree.getDirectory("a").totalSize, 29116 + 2557 + 62596 + 584);
  assert.equal(tree.getDirectory("d").totalSize, 24933642);
  assert.equal(tree.fileSize, 14848514 + 8504156);
  assert.equal(tree.totalSize, 48381165);

  const testResultLess = sumIfLess(tree, 100000);
  assert.equal(testResultLess.sum, 95437);

  const chosenFolder = chooseFolder(tree);
  assert.equal(chosenFolder.name, "d");
})();

const data = parseData("07.dat");
const tree = parseDump(data);

console.time("Time to first answer");
console.log("First Answer", sumIfLess(tree, 100000).sum);
console.timeEnd("Time to first answer");

console.time("Time to second answer");
console.log("Second Answer", chooseFolder(tree).totalSize);
console.timeEnd("Time to second answer");
