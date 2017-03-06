const fs = require('fs')
const axios = require('axios')
const chalk = require('chalk')
const { graphql } = require('graphql')
const { graphql: config } = require(`${process.cwd()}/package.json`)
const { baseURL, timeout } = config

const encode = query => `"${query.replace(/\s/ig, '').replace(/"/ig, `\\"`).toString()}"`

const pullHeaders = (args) =>
  args.reduce((accum, next, i, a) => {
    if (i % 2 === 0 && a[i].toLowerCase() === '-h') {
      const [key, value] = a[i + 1].split('=')
      accum[key] = value
    }
    return accum
  }, {})

function sendQuery (headers) {
  return function (query) {
    console.log(`${query}\n`);
    if (baseURL) {
      const instance = axios.create({
        baseURL,
        timeout: config.timeout || 5000,
        headers
      })
      return instance.post('/', encode(query))
                     .then(res => res.data)
                     .then(colorResponse)
                     .catch(console.log)
    }
    const schema = require(`${process.cwd()}/schema`)
    return graphql(schema, query)
            .then(colorResponse)
            .catch(console.log)
  }
}


const colorResponse = (res) =>
  JSON.stringify(res, null, 2)
    .replace(/"errors":/ig, `${chalk.red.bold('"errors"')}:`)
    .replace(/"data":/ig, `${chalk.green.bold('"data"')}:`)

const readFile = (path) =>
  new Promise((resolve, reject) =>
    fs.readFile(path, 'utf8', (err,data) =>
      err ? reject(err) : resolve(data)))

const checkPath = (path) =>
  new Promise((resolve, reject) =>
    fs.stat(path, (err, stats) =>
      err ? reject(err) : resolve(path)))


module.exports = {
  encode,
  sendQuery,
  readFile,
  checkPath,
  pullHeaders
}
