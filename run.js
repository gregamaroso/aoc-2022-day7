#!/usr/bin/env node

const fs = require("fs");
const readline = require("readline");


let counter = 0;
let currentDirectory = ['<root>'];
const files = {};


const isCommand = (line) => line.indexOf('$ ') !== -1;
const getCommand = (line) => {
  const [ meh, command ] = line.split(/\s(.*)/);

  if (/^cd [a-zA-Z0-9_]+/.test(command)) {
    return 'DOWN_ONE';
  }

  const staticCommands = {
    'cd ..': 'UP_ONE',
    'ls': 'LIST'
  };

  return staticCommands[command] || false;
};
const isFile = (line) => /^[\d]+ [a-z]+\.[a-z]+$/.test(line);
const isDir = (line) => line.indexOf('dir ') !== -1;


const readStream = fs.createReadStream('input.txt');
let rl = readline.createInterface({ input: readStream });

rl.on("line", (line) => {
  counter++;

  if (isCommand(line)) {
    const command = getCommand(line);

    if (command == 'DOWN_ONE') {
      currentDirectory.push(line.replace('$ cd ', ''));
    }
    if (command == 'UP_ONE') {
      currentDirectory.pop();
    }

    return;
  }

  if (isFile(line)) {
    const [ size, filename ] = line.split(' ');

    files[`${currentDirectory.join('/')}/${filename}`] = parseInt(size);
  }

  // files = {
  //   path/to/one.jpg: 11583,
  //   path/to/other/two.gif: 22463
  // }
});

rl.on("close", () => {
  const allDirs = {};

  for (const file in files) {
    const size = files[file];
    const directory = file.split('/').slice(0, -1).join('/');

    // add the file size to the directory list
    // allDirs[directory] = (directory in allDirs) ? allDirs[directory] + size : size;

    const parts = directory.split('/');
    const t = [];
    for (let i = 0; i < parts.length; i++) {
      t.push(parts[i]);

      const b = t.join('/');
      allDirs[b] = (b in allDirs) ? allDirs[b] + size : size;
    }
  }

  // allDirs = {
  //   path/to: (11583 + 22463),
  //   path/to/other: 22463
  // }

  // filter out all directoires whose size is < 100000
  const directories = Object.keys(allDirs).filter(dir => allDirs[dir] >= 100000).reduce((a, c) => {
    a[c] = allDirs[c];

    return a;
  }, {});

  let j = 0;
  Object.keys(directories).forEach(directory => {
    const d = directory.replace('<root>', '');
    const s = directories[directory];

    console.log(`${j === 0 ? '/' : d} :: ${s}`);
    j++;
  });

  process.stdout.write(`\n\n${j} items\n\n`);
});
