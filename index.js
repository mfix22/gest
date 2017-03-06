#! /usr/bin/env node
const readline = require('readline')

const { encode, sendQuery, readFile, checkPath } = require('./src/util')

const [node, file, ...args] = process.argv

if (args.length) {
  if (args.length % 2 === 0) throw new Error('Invalid Arguments')
  const queryOrFile = args.pop()
  const headers = args.reduce((accum, next, i, a) => {
    if (i % 2 === 0 && a[i] === '-h') {
      const [key, value] = a[i + 1].split('=')
      accum[key] = value
    }
    return accum
  }, {})

  checkPath(`${__dirname}/${queryOrFile}`)
    .then(readFile)
    .catch(() => queryOrFile)
    .then(sendQuery(headers))
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
