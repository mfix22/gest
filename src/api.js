const fs = require('fs')
const readline = require('readline')
const path = require('path')
const axios = require('axios')
const { graphql } = require('graphql')
const { graphql: config } = require(path.join(process.cwd(), 'package.json'))

const { pullHeaders, correctURL, colorResponse, encode } = require('./util')

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
