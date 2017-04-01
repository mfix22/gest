/* global describe, test, expect, gest */
const Gest = require('../src/index')
const schema = require('./_schema') // test fixture
const UTIL = require('../src/util')

Gest(schema) // sets Global `gest`

describe('GLOBAL', () => {
  gest('test global gest', `
    {
      test
    }
  `)
})

describe('LOCAL', () => {
  test('return result if query is okay', () => {
    // test local
    const gest = Gest(schema)

    return gest('{ test }').then(({ data }) => {
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
    expect(UTIL.encode(query)).toBe('" { test(password: \\"password\\") { id } } "')
  })
  test('flagsToOptions()', () => {
    const headers = ['key=value', 'key2=value2']
    const baseUrl = 'url'

    const options = {
      baseUrl,
      header: headers
    }

    expect(UTIL.flagsToOptions(options)).toEqual({
      baseURL: 'url',
      headers: {
        key: 'value',
        key2: 'value2'
      }
    })

    const header = 'key=value'
    expect(UTIL.flagsToOptions({ header })).toEqual({
      headers: {
        key: 'value'
      }
    })
  })
  test('correctURL()', () => {
    const url1 = 'test.com'
    const url2 = 'http://test.com'
    const url3 = 'test.com/test'
    const localUrl = 'localhost:8080'

    expect(UTIL.correctURL(url1)).toEqual('https://test.com')
    expect(UTIL.correctURL(url2)).toEqual('http://test.com')
    expect(UTIL.correctURL(url3)).toEqual('https://test.com/test')
    expect(UTIL.correctURL(localUrl)).toEqual('localhost:8080')
  })
})
