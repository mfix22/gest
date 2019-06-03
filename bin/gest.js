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
  .option(['H', 'header'], 'Set HTTP request header')
  .option(['I', 'inspect'], 'Print your GraphQL schema')
  .option(['B', 'baseURL', 'baseUrl'], 'Base URL for sending HTTP requests')
  .option(['A', 'all'], 'Run `gest` for all *.(gql|graphql|query) files')
  .option(['P', 'print'], 'Pretty print the GraphQL query')

const flags = args.parse(process.argv, {
  value: '[query | pathToFileWithQuery]',
  mainColor: ['magenta', 'bold'], // following the GraphQL brand
  usageFilter: info => info.replace('[command] ', '')
})

const getQueryString = q =>
  checkPath(path.resolve(process.cwd(), q))
    .then(readFile)
    .catch(() => q)

const wrapLogging = p =>
  p.then(message => console.log(`\n${message}`)).catch(e => console.log(e) || process.exit(1))

try {
  let schema
  const options = Object.assign({ schema: 'schema.js' }, getPackageInfo(), flagsToOptions(flags))

  try {
    schema = require(path.resolve(process.cwd(), options.schema))
  } catch (e) {
    // schema is required unless sending over HTTP
    if (!options.baseURL) throw e
  }

  if (flags.inspect) {
    return wrapLogging(
      gest(schema, options)(GraphQL.introspectionQuery)
        .then(res => res.data)
        .then(data => {
          if (!data || !data.__schema) {
            const message = `\n${chalk.red.bold('Error')}: ${
              options.baseURL
                ? 'The provided URL is not a valid GraphQL endpoint'
                : 'The provided schema is not a valid GraphQL schema'
            }\n`
            throw message
          }
          return data
        })
        .then(GraphQL.buildClientSchema)
        .then(GraphQL.printSchema)
        .then(colorizeGraphQL)
    )
  }

  if (flags.all) {
    let oneFailed = false
    readDir(process.cwd(), /.*\.(query|graphql|gql)$/i)
      .then(values => {
        console.log(
          !values.length
            ? `\n${chalk.yellow('Warning')}: no files matching *.(graphql|gql|query) were found`
            : ''
        )
        return values
      })
      .then(values =>
        Promise.all(
          values.map(v => {
            const paths = v.replace(process.cwd(), '.').split('/')
            // separate file from rest of path
            const fileName = paths.pop()
            const rep = chalk.dim(paths.concat('').join('/')).concat(fileName)
            const spinner = ora({ text: rep, color: 'magenta' }).start()
            return readFile(v)
              .then(gest(schema, Object.assign(options, { debug: false })))
              .then(value => {
                if (value.errors && value.data) spinner.warn()
                else if (value.errors) {
                  spinner.fail(`${rep}\n    -  ${value.errors}`)
                  oneFailed = true
                } else spinner.succeed()
                return value
              })
              .catch(console.log)
          })
        )
      )
      .then(() => console.log())
      .catch(console.log)
      .then(() => {
        if (oneFailed) {
          process.exit(1)
        }
      })
  } else {
    if (flags.print) {
      const q = args.sub[0] || flags.print
      return wrapLogging(
        getQueryString(q)
          .then(GraphQL.parse)
          .then(GraphQL.print)
      )
    }
    if (args.sub && args.sub.length) {
      args.sub.map(q =>
        wrapLogging(
          getQueryString(q)
            .then(gest(schema, options))
            .then(res => {
              const message = colorResponse(res) + '\n'
              if (res.errors) {
                throw '\n' + message
              }
              return message
            })
        )
      )
    } else {
      // Open REPL
      REPL(schema, options)
    }
  }
} catch (e) {
  console.log(errorMessage(e))
}
