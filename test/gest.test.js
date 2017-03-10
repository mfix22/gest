/* global describe, test, expect */
const Gest = require('../src/index')
const schema = require('./_schema') // test fixture

const { encode, flagsToOptions, correctURL } = require('../src/util')

describe('GEST', () => {
  test('return result if query is okay', () => {
    const gest = Gest(schema)

    return gest('{ test }').then(({ data, errors }) => {
      expect(data).not.toBeUndefined()
      expect(errors).toBeUndefined()
      expect(data.test).toBe('success!')
    })
  })
  test('return error message if query is invalid', () => {
    const gest = Gest(schema)

    return gest('{ _test }').then(({ data, errors }) => {
      expect(data).toBeUndefined()
      expect(errors).toHaveLength(1)
    })
  })
})

describe('UTIL', () => {
  test('encode()', () => {
    const query = `
      {
        test(password: "password") {
          id
        }
      }
    `
    expect(encode(query)).toBe('"{test(password:\\"password\\"){id}}"')
  })
  test('flagsToOptions()', () => {
    const headers = ['key=value', 'key2=value2']
    const baseUrl = 'url'

    const options = {
      baseUrl,
      header: headers
    }

    expect(flagsToOptions(options)).toEqual({
      baseURL: 'url',
      headers: {
        key: 'value',
        key2: 'value2'
      }
    })

    const header = 'key=value'
    expect(flagsToOptions({ header })).toEqual({
      headers: {
        key: 'value'
      }
    })
  })
  test('correctURL()', () => {
    const url1 = 'test.com'
    const url2 = 'http://test.com'
    const url3 = 'test.com/test'

    expect(correctURL(url1)).toEqual('https://test.com')
    expect(correctURL(url2)).toEqual('http://test.com')
    expect(correctURL(url3)).toEqual('https://test.com/test')
  })
})
