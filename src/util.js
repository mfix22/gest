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

const correctURL = (url) => {
  if (/(https?:\/\/)[\w-]+(\.[a-z-]+)+\.?(:\d+)?(\/\S*)?/gi.test(url)) return url
  if (/[\w-]+(\.[a-z-]+)+\.?(:\d+)?(\/\S*)?/gi.test(url)) return `https://${url}`
  throw new Error('Your `baseURL` must be a valid URL.')
}

function sendQuery (flags) {
  return function (query) {
    if (config && config.baseURL) {
      const instance = axios.create({
        timeout: config.timeout || 10000,
        headers: pullHeaders(flags)
      })

      const corrected = correctURL(config.baseURL)
      console.log(`${query} -> ${corrected}`)

      return instance.post(corrected, encode(query))
                     .then(res => res.data)
                     .then(colorResponse)
    }

    console.log(query)
    const schema = require(path.join(process.cwd(), (config && config.schema) || 'schema.js'))
    return graphql(schema, query)
            .then(colorResponse)
  }
}

const colorResponse = (res) =>
  `\n${JSON.stringify(res, null, 2)
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
