#! /usr/bin/env node
const args = require('./args') // TODO
const path = require('path')
const { sendQuery, readFile, checkPath, REPL } = require('./src/api')
const { flagsToOptions, colorResponse } = require('./src/util')

args
  .option('header', 'HTTP request header')
  .option('baseUrl', 'Base URL for sending HTTP requests')

const flags = args.parse(process.argv)

try {
  if (!flags.help && !flags.version) {
    let config
    try {
      config = require(path.join(process.cwd(), 'package.json')).gest
    } catch (e) {}

    const options = Object.assign({ schema: 'schema.js' }, config, flagsToOptions(flags))

    const schema = require(path.join(process.cwd(), options.schema))

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
} catch (e) {
  switch (e.code) {
    case 'MODULE_NOT_FOUND':
      console.log('\nSchema not found. Trying running `gest` with your `schema.js` in the current working directory.\n')
      break
    default: console.log(e)
  }
}
