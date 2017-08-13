const { getPackageInfo } = require('../src/import')

describe('Import', () => {
  test('should return JSON from package.json', () => {
    expect(getPackageInfo()).toEqual({ schema: './test/_schema.js' })
  })
})
