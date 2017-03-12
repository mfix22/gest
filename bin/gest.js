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
        .then(values => {
          console.log(values.map(v =>
            `${chalk.black.bgYellow(' RUNS ')} ${chalk.dim(v.replace(process.cwd(), '.'))}`).join('\n') + '\n')
          return values
        })
        .then(values =>
          Promise.all(values.map(v => {
            const rep = chalk.dim(v.replace(process.cwd(), '.'))
            return readFile(v)
              .then(gest(schema, options))
              .then(value => {
                if (value.errors && value.data) console.log(`${chalk.black.bgYellow(' WARNING ')} ${rep}`)
                else if (value.errors) console.log(`${chalk.black.bgRed(' FAIL ')} ${rep}`)
                else console.log(`${chalk.black.bgGreen(' PASS ')} ${rep}`)
                return [rep, value.errors]
              })
              .catch(console.log)
          })))
        .then(values =>
          values.map(([rep, errors]) =>
            (errors ? `\n${chalk.dim.red(rep)}: ${errors}\n` : '')).join(''))
        .then(console.log)
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
