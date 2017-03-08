#! /usr/bin/env node
const args = require('./args') // TODO
const path = require('path')
const { sendQuery, readFile, checkPath, REPL } = require('./src/api')
const { pullHeaders, colorResponse } = require('./src/util')

args
  .option('header', 'HTTP request header')
  .option('baseUrl', 'Base URL for sending HTTP requests')

const flags = args.parse(process.argv)

if (!flags.help && !flags.version) {
  let config
  let schema
  try {
    config = require(path.join(process.cwd(), 'package.json'))
  } catch (e) {}
  try {
    schema = require(path.join(process.cwd(), (config && config.schema) || 'schema'))
  } catch (e) {
    switch (e.code) {
      case 'MODULE_NOT_FOUND':
        console.log('\nSchema not found. Trying running `gest` with your `schema.js` in the current working directory.\n')
        break
      default: console.log(e)
    }
    process.exit()
  }

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
}
