/* global gest */
const stripAnsi = require('strip-ansi')
const Gest = require('../src/index')
const schema = require('./_schema') // test fixture
const util = require('../src/util')

const initializeGlobals = Gest
initializeGlobals(schema /* { globals: true } */)

describe('GLOBAL', () => {
  gest(
    'test global gest',
    `
    {
      test
    }
  `
  )
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

describe('util', () => {
  test('encode()', () => {
    const query = `
      {
        test(password: "password") {
          id
        }
      }
    `
    expect(util.encode(query)).toMatchObject({ query: '{ test(password: \\"password\\") { id } }' })
  })
  test('flagsToOptions()', () => {
    const headers = ['key=value', 'key2=value2']
    const baseUrl = 'url'

    const options = {
      baseUrl,
      header: headers
    }

    expect(util.flagsToOptions(options)).toEqual({
      baseURL: 'url',
      headers: {
        key: 'value',
        key2: 'value2'
      }
    })

    const header = 'key=value'
    expect(util.flagsToOptions({ header })).toEqual({
      headers: {
        key: 'value'
      }
    })

    expect(util.flagsToOptions({})).toEqual({})
    expect(util.flagsToOptions()).toEqual({})
  })
  test('correctURL()', () => {
    const url1 = 'test.com'
    const url2 = 'http://test.com'
    const url3 = 'test.com/test'
    const localUrl = 'localhost:8080'
    const dockerEndpoint = 'http://api/graphql'

    expect(util.correctURL(url1)).toEqual('https://test.com')
    expect(util.correctURL(url2)).toEqual('http://test.com')
    expect(util.correctURL(url3)).toEqual('https://test.com/test')
    expect(util.correctURL(localUrl)).toEqual('localhost:8080')
    expect(util.correctURL(dockerEndpoint)).toEqual('http://api/graphql')
    expect(() => util.correctURL('bleh')).toThrow()
  })
  test('errorMessage', () => {
    expect(util.errorMessage({ error: 'error' })).toEqual({ error: 'error' })
    expect(
      stripAnsi(util.errorMessage({ error: 'error', code: 'MODULE_NOT_FOUND' }))
    ).toMatchSnapshot()
  })
  test('colorizeGraphQL', () => {
    const message = `
      type User {
        id: String
      }
    `
    expect(stripAnsi(util.colorizeGraphQL(message))).toMatchSnapshot()
  })
  test('colorResponse', () => {
    const testCases = [
      { data: { message: 'success' } },
      { data: { message: 'success' }, errors: [{ message: 'failure' }] },
      { errors: [{ message: 'failure' }] }
    ].map(util.colorResponse)

    testCases.forEach(res => expect(stripAnsi(res)).toMatchSnapshot())
  })
})
