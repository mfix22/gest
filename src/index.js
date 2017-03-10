const axios = require('axios')
const { graphql } = require('graphql')

const { correctURL, encode, DEFAULT_CONFIG } = require('./util')

function Gest (schema, config) {
  const { baseURL, headers, timeout } = Object.assign(DEFAULT_CONFIG, config)
  return function (query) {
    if (baseURL) {
      const instance = axios.create({
        timeout,
        headers
      })

      const corrected = correctURL(baseURL)
      console.log(`${query} -> ${corrected}`)

      return instance.post(corrected, encode(query))
                     .then(res => res.data)
    }

    console.log(query)
    return graphql(schema, query)
  }
}

module.exports = Gest
