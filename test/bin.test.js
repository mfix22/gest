const path = require('path')
const execa = require('execa')

function run (command) {
  return execa.stdout('node', [path.join(__dirname, '..', 'bin', 'gest'), command])
}

const TEST_CASES = [
  '--inspect',
  '-I',
  '{ test }',
  '{ _test }'
]

TEST_CASES.forEach((flag) => {
  test(`gest ${flag}`, async () => {
    expect(await run(flag)).toMatchSnapshot()
  })
})
