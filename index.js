#! /usr/bin/env node
const { sendQuery, readFile, checkPath, REPL } = require('./src/util')

const [node, file, ...args] = process.argv

if (args.length && args.length % 2 === 1) {
  const queryOrFile = args.pop()

  return checkPath(`${__dirname}/${queryOrFile}`)
          .then(readFile)
          .catch(() => queryOrFile)
          .then(sendQuery(args))
          .then(console.log)
          .catch(console.log)
}

// REPL
REPL(args)
