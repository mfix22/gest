// Native
const readline = require('readline')

// Ours
const gest = require('./index')
const { colorResponse } = require('./util')

function REPL (schema, options) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  rl.on('SIGINT', () => rl.close())
  rl.on('SIGTSTP', () => rl.close())

  function prompt (ask) {
    rl.question(ask, query => {
      if (query.toLowerCase().trim() === 'quit') return rl.close()
      if (query.trim() === '') return prompt('Query: ') // §
      return gest(schema, options)(query)
              .then(colorResponse)
              .then(message => console.log(`\n${message}\n`))
              .catch(console.log)
              .then(() => prompt('Query: '))
    })
  }

  prompt('Query: ')
}

module.exports = exports.default = REPL
