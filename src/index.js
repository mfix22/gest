const axios = require('axios')

const { graphql } = require('./import').getGraphQL()
const { correctURL, encode } = require('./util')

function Gest (schema, config = {}) {
  const { baseURL, headers, timeout } = Object.assign({ timeout: 10000, headers: {} }, config) // default config
  return function (query) {
    if (baseURL) {
      const instance = axios.create({
        timeout,
        headers
      })

      const corrected = correctURL(baseURL)
      if (config.verbose) console.log(`${query} -> ${corrected}`)

      return instance.post(corrected, encode(query))
                     .then(res => res.data)
                     .catch(e => e.response.data)
    }

    if (config.verbose) console.log(query)
    return graphql(schema, query, null, { headers })
  }
}

module.exports = exports.default = Gest
