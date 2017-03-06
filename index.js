#! /usr/bin/env node
const readline = require('readline')

const { encode, sendQuery, readFile, checkPath, pullHeaders } = require('./src/util')

const [node, file, ...args] = process.argv

let headers

if (args.length && args.length % 2 === 1) {
  const queryOrFile = args.pop()
  headers = pullHeaders(args)

  checkPath(`${__dirname}/${queryOrFile}`)
    .then(readFile)
    .catch(() => queryOrFile)
    .then(sendQuery(headers))
    .then(console.log)
    .catch(console.log)
} else  {
  if (args.length) headers = pullHeaders(args)
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })


  rl.question('Query: ', (query) => {
    sendQuery(headers)(query)
      .then(console.log)
      .catch(console.log)
    rl.close()
  })
}
