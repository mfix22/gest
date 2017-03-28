# 👨‍💻 graphicli
#### A sensible GraphQL testing CLI.

## Usage
```bash
$ npm install -g graphicli
```

then send queries with `gest` (pronounced _guest_ [/ɡest/])
```bash
$ gest [options] [quotedQuery | pathToFileWithQuery]
```

##### Examples
```bash
$ gest '{ test }'
```
or
```bash
$ gest test.query

# with `test.query` containing
{
  test
}
```

or multiple
```bash
$ gest test.query '{ test }' introspection.query
# will run all three queries!
```

### REPL
```bash
$ gest

Query: { test }

{
  data: {
    test: "success!"
  }
}
```

### HTTP
If you specify a `baseURL` in your [`config`](#config), `gest` will send an [`axios`](https://github.com/mzabriskie/axios) `POST` request with your query correctly encoded in the body. Your `baseURL` must be a valid URL.

You can specify HTTP headers by using `-H key=value` [flags](#options).

This is especially convenient if you are using a [`now`](https://zeit.co/now) workflow.

##### Example
```bash
$ gest -H Authorization=e130294e --baseURL https://test-server-2ae34342.now.sh '{ test }'
```

### Local module
You can use `gest` as a local module in your unit/integration tests

##### Example
`gest` with [`jest`](https://facebook.github.io/jest/)
```javascript

const Gest = require('graphicli')
const schema = require('../src/schema')

const gest = Gest(schema, {
  baseURL: 'test-server.now.sh',
  headers: {
    Authorization: 'Bearer token',
    Accept: 'application/json'
  }
})

describe('GraphQL', () => {
  test('{ test }', () => {
    return gest('{ test }').then(({ data, errors }) => {
      expect(errors).toBeUndefined()
      expect(data).toEqual('success!')
    })
  })
})
```

## Options
##### `--all (-A)`
Running `gest --all` will run all files matching `*.query`, `*.graphql`, or `*.gql` and
simply print if each query succeeded without errors

##### `--inspect (-I)`
For convenience, running `gest --inspect` or `gest -I` will print your GraphQL schema

##### `--schema (-S)`
You can specify the path to your GraphQL schema with `gest --schema ./path/to/schema.js`

##### `--baseURL (-B)`
URL to send GraphQL queries to: `gest --baseURL https://test-server.now.sh`

##### `--header (-H)`
HTTP request headers to send with your queries: `gest --header Accept=application/json`.
Headers will be passed into context as `context.headers` for every query for local testing.

## Convention
`graphicli` will look to resolve your GraphQL schema in the current working directory for `schema.js`. If you wish to specify a different schema location, do so as `schema` in your [`config`](#config).

## Config
You can configure the `graphicli` runtime by adding a `gest` key to your `package.json`, or specifying them as flags.

##### Example
```json
# package.json
{
  "name": "your_package",
  ...
  "gest": {
    "schema": "./path/to/schema",
    "baseURL": "https://your.url.sh"
  }
}
```

## Why `gest`?
##### Pros
- :+1:  No restarting your dev server when you make changes
- :+1:  Testing your schema doesn't require a separate window (e.g. Graphiql)
- :+1:  Run queries [from files](#usage) (save the queries you use most often)
- :+1: Easy regression testing by with `gest --all`.
- :+1:  _Helpful_ error messages!

##### Drawbacks
- :-1:  No query autocompletion ([yet](https://github.com/mfix22/graphicli/issues/1))
- :-1:  No multi-line input without using separate files ([so far](https://github.com/mfix22/graphicli/issues/2))

## Need help?
Running `gest help` will show you all the `gest` options. If you have any other concerns, [post an issue!](https://github.com/mfix22/graphicli/issues)

## License
MIT
