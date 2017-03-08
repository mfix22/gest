const fs = require('fs')
const readline = require('readline')
const axios = require('axios')
const { graphql } = require('graphql')

const { correctURL, colorResponse, encode, DEFAULT_CONFIG } = require('./util')

function REPL (schema, options) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  rl.on('SIGINT', () => rl.close())
  rl.on('SIGTSTP', () => rl.close())

  function prompt () {
    rl.question('Query: ', query => {
      if (query.toLowerCase().trim() === 'quit') return rl.close()
      return sendQuery(schema, options)(query)
              .then(colorResponse)
              .then(console.log)
              .catch(console.log)
              .then(() => prompt())
    })
  }

  prompt()
}

function sendQuery (schema, config) {
  const { baseURL, headers, timeout } = Object.assign(DEFAULT_CONFIG, config)
  return function (query) {
    if (baseURL) {
      const instance = axios.create({
        timeout,
        headers
      })

      const corrected = correctURL(baseURL)
      console.log(`${query} -> ${corrected}`)

      return instance.post(corrected, encode(query))
                     .then(res => res.data)
    }

    console.log(query)
    return graphql(schema, query)
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
  REPL,
  sendQuery,
  readFile,
  checkPath
}
