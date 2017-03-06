#! /usr/bin/env node
const readline = require('readline')

const { encode, sendQuery, readFile, checkPath } = require('./src/util')

const [node, file, ...args] = process.argv

if (args.length) {
  const queryOrFile = args[0]

  checkPath(`${__dirname}/${queryOrFile}`)
    .then(readFile)
    .catch(() => queryOrFile)
    .then(sendQuery)
    .then(console.log)
    .catch(console.log)
} else  {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })


  rl.question('Query: ', (query) => {
    sendQuery(query)
    rl.close()
  })
}
