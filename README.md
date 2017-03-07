# graphicli
#### GraphQL testing CLI

## Usage
```bash
$ npm install -g graphicli
```

then send queries like:
```bash
$ gest [options] [quotedQuery | pathToFileWithQuery]
```

##### Examples
```bash
$ gest "{ test }"
```
or
```bash
$ gest test.query

# with `test.query` containing
{
  test
}
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
If you specify a `baseURL` in your [`config`](#config), gest will send an [`axios`](https://github.com/mzabriskie/axios) `POST` request with your query in the body. Your `baseURL` must be a fully qualified URL.

You can specifiy HTTP headers by using `-h key=value` flags.
##### Example
```bash
$ gest -h Authorization=e130294e -h Accept=application/json "{ test }"
```

## Convention
`graphicli` will look to resolve your GraphQL schema in the current working directory for `schema.js`. If you wish to specify a different schema location, do so as `schema` in your [`config`](#config).

## Config
You can configure the `graphicli` runtime by adding a `graphql` key to your `package.json`

##### Example
```json
# package.json
{
  "name": "your_package",
  ...
  "graphql": {
    "schema": "./path/to/schema",
    "baseURL": "https://your.url.sh"
  }
}
```
