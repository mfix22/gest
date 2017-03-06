#! /usr/bin/env node
const readline = require('readline')

const { encode, sendQuery, readFile, checkPath, pullHeaders } = require('./src/util')

const [node, file, ...args] = process.argv

if (args.length && args.length % 2 === 1) {
  const queryOrFile = args.pop()

  checkPath(`${__dirname}/${queryOrFile}`)
    .then(readFile)
    .catch(() => queryOrFile)
    .then(sendQuery(args))
    .then(console.log)
    .catch(console.log)
} else  {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  rl.question('Query: ', (query) => {
    sendQuery(args)(query)
      .then(console.log)
      .catch(console.log)
    rl.close()
  })
}
