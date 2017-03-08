#! /usr/bin/env node
const args = require('args')
const path = require('path')
const { graphql: config } = require(path.join(process.cwd(), 'package.json'))
const { sendQuery, readFile, checkPath, REPL } = require('./src/api')
const { pullHeaders, colorResponse } = require('./src/util')

const schema = require(path.join(process.cwd(), (config && config.schema) || 'schema.js'))

args
  .option('header', 'HTTP request header')
  .option('baseUrl', 'Base URL for sending HTTP requests')

const flags = args.parse(process.argv)

const options = Object.assign({}, config, pullHeaders(flags), { baseURL: flags.baseUrl })

if (args.sub && args.sub.length) {
  checkPath(path.join(__dirname, args.sub[0]))
    .then(readFile)
    .catch(() => args.sub[0])
    .then(sendQuery(schema, options))
    .then(colorResponse)
    .then(console.log)
    .catch(console.log)
    .then(() => process.exit())
} else {
  // REPL
  REPL(schema, options)
}
