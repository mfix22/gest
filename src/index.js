// Packages
const axios = require('axios')

// Ours
const { graphql } = require('./import').getGraphQL()
const { correctURL, encode } = require('./util')

const ENV = process.env.NODE_ENV

const DEFAULT = {
  timeout: 10000,
  headers: {},
  globals: ENV === 'test' && (global.test !== undefined || global.it !== undefined),
  debug: ENV === 'debug'
}

function Gest(schema, config) {
  const { baseURL, headers, timeout, globals, debug } = Object.assign({}, DEFAULT, config) // default config

  const instance = axios.create({
    timeout,
    headers
  })

  const gest = query => {
    if (baseURL) {
      const corrected = correctURL(baseURL)
      if (debug) console.log(`${query} -> ${corrected}`)

      return instance
        .post(corrected, encode(query))
        .then(res => res.data)
        .catch(e => {
          if (e.response) {
            return e.response.data
          }
          return e
        })
    }

    if (debug) console.log(query)
    return graphql(schema, query, null, { headers })
  }

  if (globals) {
    // test global gest() function for shortcut testing with `jest`
    global['gest'] = (name, query) => {
      const test = global.test || global.it
      test(name, () => {
        return gest(query).then(result => {
          if (result.errors) throw result.errors
          return result
        })
      })
    }
  }

  return gest
}

module.exports = exports.default = Gest
