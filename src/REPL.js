// Native
const readline = require('readline')

// Ours
const gest = require('./index')
const { colorResponse } = require('./util')

function REPL(schema, options) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  rl.on('SIGINT', () => rl.close())
  rl.on('SIGTSTP', () => rl.close())

  function resetReplState() {
    return {
      midCommandFlag: false,
      numRemainingParens: 0,
      querySoFar: ''
    }
  }

  function processQuery(query) {
    let numLeft = 0
    let numRight = 0

    query.split('').forEach((letter, index) => {
      if (!isEscaped(query, index)) {
        if (letter === '}') {
          numRight++
        } else if (letter === '{') {
          numLeft++
        }
      }
    })

    return { numRight, numLeft }
  }

  function isEscaped(string, index) {
    let count = 0
    let curr = index - 1

    while (curr >= 0 && string.charAt(curr) === '\\') {
      count++
      curr--
    }

    return count % 2 !== 0
  }

  let replState = resetReplState()

  function prompt(ask) {
    rl.question(ask, query => {
      if (query.toLowerCase().trim() === 'quit') return rl.close()

      // handle multiline input
      const { numLeft, numRight } = processQuery(query)
      const numAdditionalRight = numRight - numLeft
      const numAdditionalLeft = numLeft - numRight

      if (replState.midCommandFlag) {
        const newBalance = replState.numRemainingParens - numAdditionalRight
        if (newBalance > 0) {
          replState.numRemainingParens = newBalance
          replState.querySoFar += query
          return prompt('')
        } else {
          query = replState.querySoFar + query
          replState = resetReplState()
        }
      } else {
        if (numAdditionalLeft > 0) {
          replState.midCommandFlag = true
          replState.numRemainingParens = numAdditionalLeft
          replState.querySoFar = query

          return prompt('')
        }
      }

      if (query.trim() === '') return prompt('> ') // §

      return gest(schema, options)(query)
        .then(colorResponse)
        .then(message => console.log(`\n${message}\n`))
        .catch(console.log)
        .then(() => prompt('> '))
    })
  }

  prompt('Query: ')
}

module.exports = exports.default = REPL
