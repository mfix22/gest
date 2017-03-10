#! /usr/bin/env node
const args = require('args')
const path = require('path')
const { printSchema } = require('graphql')

const gest = require('../src/index')
const REPL = require('../src/REPL')
const { readFile, checkPath, flagsToOptions, colorResponse } = require('../src/util')

args
  .option(['S', 'schema'], 'Path to your GraphQL schema')
  .option(['I', 'inspect'], 'Print your GraphQL schema options')
  .option(['H', 'header'], 'HTTP request header')
  .option(['B', 'baseUrl'], 'Base URL for sending HTTP requests')

const flags = args.parse(process.argv)
try {
  if (!flags.help && !flags.version) {
    let config
    try {
      config = require(path.join(process.cwd(), 'package.json')).gest
    } catch (e) {}

    const options = Object.assign({ schema: 'schema.js' }, config, flagsToOptions(flags))

    const schema = require(path.join(process.cwd(), options.schema))

    if (flags.inspect) {
      console.log(printSchema(schema))
      process.exit()
    }

    if (args.sub && args.sub.length) {
      checkPath(path.join(process.cwd(), args.sub[0]))
      .then(readFile)
      .catch(() => args.sub[0])
      .then(gest(schema, options))
      .then(colorResponse)
      .then(console.log)
      .catch(console.log)
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
