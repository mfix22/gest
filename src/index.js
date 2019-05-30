// Packages
const fetch = require('node-fetch')

// Ours
const { graphql } = require('./import').getGraphQL()
const { correctURL } = require('./util')

const ENV = process.env.NODE_ENV

const DEFAULT = {
  headers: {},
  globals: ENV === 'test' && (global.test !== undefined || global.it !== undefined),
  debug: ENV === 'debug'
}

function Gest(schema, config) {
  const { baseURL, headers, globals, debug } = Object.assign({}, DEFAULT, config) // default config

  const gest = query => {
    if (baseURL) {
      const corrected = correctURL(baseURL)

      if (debug) console.log(`${query} -> ${corrected}`)

      return fetch(corrected, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({ query })
      })
        .then(res => res.json())
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
