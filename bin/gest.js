#! /usr/bin/env node
// Native
const path = require('path')

// Packages
const args = require('args')
const chalk = require('chalk')
const ora = require('ora')

// Ours
const gest = require('../src/index')
const REPL = require('../src/REPL')
const {
  readFile,
  checkPath,
  flagsToOptions,
  colorResponse,
  colorizeGraphQL,
  readDir,
  errorMessage
} = require('../src/util')

const { getGraphQL, getPackageInfo } = require('../src/import')
const GraphQL = getGraphQL()

args
  .option(['S', 'schema'], 'Path to your GraphQL schema')
  .option(['H', 'header'], 'HTTP request header')
  .option(['I', 'inspect'], 'Print your GraphQL schema options')
  .option(['B', 'baseUrl'], 'Base URL for sending HTTP requests')
  .option(['A', 'all'], 'Run `gest` for all *.(gql|graphql|query) files')

const flags = args.parse(process.argv, {
  value: '[query | queryPath]',
  mainColor: ['magenta', 'bold'], // following the GraphQL brand
  usageFilter: info => info.replace('[command] ', '')
})

try {
  let schema
  const options = Object.assign({ schema: 'schema.js' }, getPackageInfo(), flagsToOptions(flags))

  try {
    schema = require(path.join(process.cwd(), options.schema))
  } catch (e) {
    // schema is required unless sending over HTTP
    if (!options.baseURL) throw e
  }

  if (flags.inspect) {
    console.log('\n' + colorizeGraphQL(GraphQL.printSchema(schema)))
    process.exit()
  }

  if (flags.all) {
    readDir(process.cwd(), /.*\.(query|graphql|gql)$/i)
      .then(values => {
        if (!values.length) {
          console.log(`\n${chalk.yellow('Warning')}: no files matching *.(graphql|gql|query) were found`);
        } else {
          console.log();
        }
        return values
      })
      .then(values =>
        Promise.all(values.map(v => {
          const paths = v.replace(process.cwd(), '.').split('/')
          // separate file from rest of path
          const fileName = paths.pop()
          const rep = chalk.dim(paths.concat('').join('/')).concat(fileName)
          const spinner = ora({ text: rep, color: 'magenta' }).start()
          return readFile(v)
            .then(gest(schema, Object.assign(options, { verbose: false })))
            .then(value => {
              if (value.errors && value.data) spinner.warn()
              else if (value.errors) spinner.fail(`${rep}\n    -  ${value.errors}`)
              else spinner.succeed()
              return [rep, value.errors]
            })
            .catch(console.log)
        })))
      .then(() => console.log())
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
      // Open REPL
      REPL(schema, options)
    }
  }
} catch (e) {
  console.log(errorMessage(e))
}
