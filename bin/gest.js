#! /usr/bin/env node
const args = require('args')
const path = require('path')
const chalk = require('chalk')

const gest = require('../src/index')
const REPL = require('../src/REPL')
const {
  readFile,
  checkPath,
  flagsToOptions,
  colorResponse,
  colorizeGraphQL,
  findFiles,
  errorMessage
} = require('../src/util')

let GraphQL
try {
  // do to GraphQL schema issue [see](https://github.com/graphql/graphiql/issues/58)
  GraphQL = require(path.join(process.cwd(), './node_modules/graphql'))
} catch (e) {
  // fallback if graphql is not installed locally
  GraphQL = require('graphql')
}
const { printSchema } = GraphQL

args
  .option(['S', 'schema'], 'Path to your GraphQL schema')
  .option(['H', 'header'], 'HTTP request header')
  .option(['I', 'inspect'], 'Print your GraphQL schema options')
  .option(['B', 'baseUrl'], 'Base URL for sending HTTP requests')
  .option(['A', 'all'], 'Run `gest` for all *.query files')

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
      console.log('\n' + colorizeGraphQL(printSchema(schema)))
      process.exit()
    }

    if (flags.all) {
      findFiles()
        .then(values => {
          console.log(`${chalk.black.bgYellow(' RUNS ')} ${values.map(v => `${chalk.dim(v.replace(process.cwd(), '.'))}`).join(' ')}\n`)
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
        args.sub.map(q =>
          checkPath(path.join(process.cwd(), q))
            .then(readFile)
            .catch(() => q)
            .then(gest(schema, options))
            .then(colorResponse)
            .then(message => console.log(`\n${message}\n`))
            .catch(console.log))
      } else {
        // REPL
        REPL(schema, options)
      }
    }
  }
} catch (e) {
  console.log(errorMessage(e))
}
