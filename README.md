<h1 align="center">
  <img src='https://raw.githubusercontent.com/mfix22/gest/master/media/logo.png' height='80px' alt='Gest - A sensible GraphQL testing CLI and tool.'>
</h1>
<h3 align="center">A sensible GraphQL testing tool.</h3>
<p  align="center">
  <a href="https://github.com/facebook/jest">
    <img src="https://img.shields.io/badge/tested_with-jest-99424f.svg" alt="tested with jest" />
  </a>
  <a href="https://github.com/mfix22/gest">
    <img src="https://img.shields.io/badge/tested_with-gest-e00098.svg" alt="tested with gest" />
  </a>
</p>

## Usage

```bash
$ npm install -g graphicli
# (Sorry about the package name!)
```

then send queries with `gest` (pronounced _guest_ [/ɡest/]).

```bash
$ gest [options] [quotedQuery | pathToFileWithQuery]
```

##### Examples

```bash
$ gest '{ test }'
```

or

```bash
$ gest test.graphql

# with `test.graphql` containing
{
  test
}
```

or multiple

```bash
$ gest test.graphql '{ test }' introspection.graphql
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

If you specify a `baseURL` in your [`config`](#config), `gest` will send an `POST` request with your query correctly encoded in the body. Your `baseURL` must be a valid URL.

You can specify HTTP headers by using `-H key=value` [flags](#flags).

This is especially convenient if you are using a [`now`](https://zeit.co/now) workflow.

##### Example

```bash
$ gest -H Authorization=e130294e --baseURL https://test-server-2ae34342.now.sh '{ test }'
```

### Local module

You can use `gest` as a local module in your unit/integration tests

##### Examples

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

or use Global `gest` with [`jest`](https://facebook.github.io/jest/).

```javascript
// will create global `gest()` function
Gest(schema)

// pass a test name and a query
gest(
  'test query',
  `
  {
    test
  }
`
)
```

**Note**: Global functionality will be turned on by default if `NODE_ENV === test` and if `global.test` or `global.it` exists

## Flags

##### `--all (-A)`

Running `gest --all` will run all files matching `*.query`, `*.graphql`, or `*.gql` and
simply print if each query succeeded without errors

##### `--inspect (-I)`

For convenience, running `gest --inspect` or `gest -I` will print your GraphQL schema

##### `--print (-P)`

Pretty print your GraphQL queries (without using GraphiQL!)

```bash
$ gest [query | pathToQuery] --print
```

###### Example

```bash
$ gest '{test}' --print

{
  test
}
```

##### `--schema (-S)`

You can specify the path to your GraphQL schema with `gest --schema ./path/to/schema.js`

##### `--baseURL (-B)`

URL to send GraphQL queries to: `gest --baseURL https://test-server.now.sh`

##### `--header (-H)`

HTTP request headers to send with your queries: `gest --header Accept=application/json`.
Headers will be passed into context as `context.headers` for every query for local testing.

## Convention

The `gest` CLI will look to resolve your GraphQL schema in the current working directory for `schema.js`. If you wish to specify a different schema location, do so as `schema` in your [`config`](#config).

## Config

You can configure the `gest` runtime by adding a `gest` key to your `package.json`, or specifying them as flags.

##### Example

```javascript
// package.json
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

- :+1: No restarting your dev server when you make changes
- :+1: Testing your schema doesn't require a separate window (e.g. Graphiql)
- :+1: Run queries [from files](#usage) (save the queries you use most often)
- :+1: Simple unit testing for your schema
- :+1: Easy regression testing with [`gest --all`](#flags).
- :+1: Simple integration/deployment testing with [`--baseURL`](#http)
- :+1: _Helpful_ error messages!

##### Drawbacks

- :-1: No query autocompletion ([yet](https://github.com/mfix22/gest/issues/1))

## Contributing

1. [Fork](https://help.github.com/articles/fork-a-repo/) this repository to your own GitHub account and then [clone](https://help.github.com/articles/cloning-a-repository/) it locally
2. Install the dependencies: `npm install`
3. Run `npm link` to link the scripts found in `bin` for testing terminal commands
4. Before submitting a pull request, run `npm test`

## Need help?

Running `gest help` will show you all the `gest` options. If you have any other concerns, [post an issue!](https://github.com/mfix22/gest/issues)

## Logo

The official `gest` logo is designed by [`@jakedex`](https://github.com/jakedex)

## License

MIT
