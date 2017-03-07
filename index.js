#! /usr/bin/env node
const { sendQuery, readFile, checkPath, REPL } = require('./src/util')

const args = process.argv.slice(2)

if (args.length && args.length % 2 === 1) {
  const queryOrFile = args.pop()

  checkPath(`${__dirname}/${queryOrFile}`)
    .then(readFile)
    .catch(() => queryOrFile)
    .then(sendQuery(args))
    .then(console.log)
    .catch(console.log)
    .then(() => process.exit())
} else {
  // REPL
  REPL(args)
}
