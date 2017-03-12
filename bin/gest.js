#! /usr/bin/env node
const args = require('args')
const path = require('path')
const { printSchema } = require('graphql')
const chalk = require('chalk')

const gest = require('../src/index')
const REPL = require('../src/REPL')
const { readFile, checkPath, flagsToOptions, colorResponse, errorMessage, findFiles } = require('../src/util')

args
  .option(['S', 'schema'], 'Path to your GraphQL schema')
  .option(['I', 'inspect'], 'Print your GraphQL schema options')
  .option(['H', 'header'], 'HTTP request header')
  .option(['B', 'baseUrl'], 'Base URL for sending HTTP requests')
  .option('all', 'Run all *.query files')

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

    if (flags.all) {
      findFiles()
        .then(values =>
          values.map(v => {
            const rep = chalk.dim(v.replace(process.cwd(), '.'))
            console.log(`${chalk.black.bgYellow(' RUNS ')} ${rep}`)
            readFile(v)
              .then(gest(schema, options))
              .then(value => {
                if (value.errors && value.data) return `${chalk.black.bgYellow(' WARNING ')} ${rep}`
                if (value.errors) return `${chalk.black.bgRed(' FAIL ')} ${rep}`
                return `${chalk.black.bgGreen(' PASS ')} ${rep}`
              })
              .then(console.log)
              .catch(console.log)
          }))
        .catch(console.log)
    } else {
      // DEFAULT COMMAND
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
  }
} catch (e) {
  console.log(errorMessage(e))
}
