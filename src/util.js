const chalk = require('chalk')

exports.DEFAULT_CONFIG = { timeout: 10000, headers: {} }

exports.encode = query => `"${query.replace(/\s/ig, '').replace(/"/ig, `\\"`).toString()}"`

exports.pullHeaders = ({ header }) => {
  if (!header) return undefined
  if (typeof header === 'string') {
    const [key, value] = header
    return {
      headers: { [key]: value }
    }
  }
  return {
    headers: header.reduce((accum, next) => {
      const [key, value] = next.split('=')
      accum[key] = value
      return accum
    }, {})
  }
}

exports.correctURL = (url) => {
  if (/(https?:\/\/)[\w-]+(\.[a-z-]+)+\.?(:\d+)?(\/\S*)?/gi.test(url)) return url
  if (/[\w-]+(\.[a-z-]+)+\.?(:\d+)?(\/\S*)?/gi.test(url)) return `https://${url}`
  throw new Error('Your `baseURL` must be a valid URL.')
}

exports.colorResponse = (res) =>
  `\n${JSON.stringify(res, null, 2)
    .replace(/errors/i, chalk.red.bold('$&'))
    .replace(/data/i, chalk.green.bold('$&'))
    .replace(/\\"/ig, `"`)
    .replace(/Did you mean ".+?"/ig, chalk.yellow.bold('$&'))}\n`
