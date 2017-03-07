#! /usr/bin/env node
const args = require('args')
const { sendQuery, readFile, checkPath, REPL } = require('./src/util')

args
  .option('header', 'HTTP request header')
  .option('baseURL', 'Base URL for sending HTTP requests')

const flags = args.parse(process.argv)

if (args.sub && args.sub.length) {
  checkPath(`${__dirname}/${args.sub[0]}`)
    .then(readFile)
    .catch(() => args.sub[0])
    .then(sendQuery(flags))
    .then(console.log)
    .catch(console.log)
    .then(() => process.exit())
} else {
  // REPL
  REPL(flags)
}
