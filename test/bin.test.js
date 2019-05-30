const path = require('path')
const execa = require('execa')

function run(command) {
  return execa.stdout('node', [path.resolve(__dirname, '..', 'bin', 'gest'), command])
}

test.each(['--inspect', '-I', '{ test }'])(`success cases %s`, async flag => {
  expect(await run(flag)).toMatchSnapshot()
})

test.each(['{ _test }'])(`failures case: %s`, async flag => {
  try {
    await run(flag)
  } catch (e) {
    expect(e.stdout).toMatchSnapshot()
  }
})
