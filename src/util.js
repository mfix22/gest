const fs = require('fs')
const readline = require('readline')
const path = require('path')
const axios = require('axios')
const chalk = require('chalk')
const { graphql } = require('graphql')
const { graphql: config } = require(path.join(process.cwd(), 'package.json'))

const encode = query => `"${query.replace(/\s/ig, '').replace(/"/ig, `\\"`).toString()}"`

function REPL (args) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  rl.on('SIGINT', () => rl.close())
  rl.on('SIGTSTP', () => rl.close())

  function prompt (args) {
    rl.question('Query: ', (query) => {
      sendQuery(args)(query)
        .then(console.log)
        .catch(console.log)
        .then(() => prompt(args))
    })
  }

  prompt(args)
}

const pullHeaders = ({ yheader }) => {
  if (typeof yheader === 'string') {
    const [key, value] = yheader
    return { [key]: value }
  }
  return yheader.reduce((accum, next) => {
    const [key, value] = next.split('=')
    accum[key] = value
    return accum
  }, {})
}

function sendQuery (flags) {
  return function (query) {
    console.log(`${query}\n`)
    if (config.baseURL) {
      const instance = axios.create({
        baseURL: config.baseURL,
        timeout: config.timeout || 5000,
        headers: pullHeaders(flags)
      })
      return instance.post('/', encode(query))
                     .then(res => res.data)
                     .then(colorResponse)
                     .catch(console.log)
    }
    const schema = require(path.join(process.cwd(), config.schema || 'package.json'))
    return graphql(schema, query)
            .then(colorResponse)
            .catch(console.log)
  }
}

const colorResponse = (res) =>
  JSON.stringify(res, null, 2)
    .replace(/"errors":/ig, `${chalk.red.bold('"errors"')}:`)
    .replace(/"data":/ig, `${chalk.green.bold('"data"')}:`) + '\n'

const readFile = (path) =>
  new Promise((resolve, reject) =>
    fs.readFile(path, 'utf8', (err, data) =>
      err ? reject(err) : resolve(data)))

const checkPath = (path) =>
  new Promise((resolve, reject) =>
    fs.stat(path, (err, stats) =>
      err ? reject(err) : resolve(path)))

module.exports = {
  encode,
  sendQuery,
  readFile,
  checkPath,
  pullHeaders,
  REPL
}
