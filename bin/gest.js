#! /usr/bin/env node
const args = require('args')
const path = require('path')
const { printSchema } = require('graphql')

const gest = require('../src/index')
const REPL = require('../src/REPL')
const { readFile, checkPath, flagsToOptions, colorResponse, colorizeGraphQL, errorMessage } = require('../src/util')

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
      console.log(colorizeGraphQL(printSchema(schema)))
      process.exit()
    }

    if (args.sub && args.sub.length) {
      args.sub.map(q =>
        checkPath(path.join(process.cwd(), q))
          .then(readFile)
          .catch(() => q)
          .then(gest(schema, options))
          .then(colorResponse)
          .then(res => console.log(`\n${res}\n`))
          .catch(console.log))
    } else {
      // REPL
      REPL(schema, options)
    }
  }
} catch (e) {
  console.log(errorMessage(e))
}
