const path = require('path')
const execa = require('execa')
const stripAnsi = require('strip-ansi')

function run(command) {
  return execa.stdout('node', [path.resolve(__dirname, '..', 'bin', 'gest'), command])
}

test.each(['--inspect', '-I', '{ test }'])(`success cases %s`, async flag => {
  expect(stripAnsi(await run(flag))).toMatchSnapshot()
})

test.each(['{ _test }'])(`failures case: %s`, async flag => {
  try {
    await run(flag)
  } catch (e) {
    expect(stripAnsi(e.stdout)).toMatchSnapshot()
  }
})
