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

const pullHeaders = ({ header }) => {
  if (!header) return {}
  if (typeof header === 'string') {
    const [key, value] = header
    return { [key]: value }
  }
  return header.reduce((accum, next) => {
    const [key, value] = next.split('=')
    accum[key] = value
    return accum
  }, {})
}

const testURL = (url) => /(^|\s)((https?:\/\/)[\w-]+(\.[a-z-]+)+\.?(:\d+)?(\/\S*)?)/gi.test(url)

function sendQuery (flags) {
  return function (query) {
    console.log(`${query}\n`)
    if (config && config.baseURL) {
      if (!testURL(config.baseURL)) throw new Error('Your `baseUrl` must be a domain with "http(s)"')

      const instance = axios.create({
        timeout: config.timeout || 5000,
        headers: pullHeaders(flags)
      })

      return instance.post(config.baseURL, encode(query))
                     .then(res => res.data)
                     .then(colorResponse)
    }
    const schema = require(path.join(process.cwd(), (config && config.schema) || 'schema.js'))
    return graphql(schema, query)
            .then(colorResponse)
  }
}

const colorResponse = (res) =>
  `${JSON.stringify(res, null, 2)
    .replace(/errors/i, chalk.red.bold('$&'))
    .replace(/data/i, chalk.green.bold('$&'))
    .replace(/\\"/ig, `"`)
    .replace(/Did you mean ".+?"/ig, chalk.yellow.bold('$&'))}\n`

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
