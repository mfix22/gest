// Native
const path = require('path')

let GraphQL
let packageInfo

try {
  // do to GraphQL schema issue [see](https://github.com/graphql/graphiql/issues/58)
  GraphQL = require(path.join(process.cwd(), './node_modules/graphql'))
} catch (e) {
  // fallback if graphql is not installed locally
  GraphQL = require('graphql')
}

try {
  packageInfo = require(path.join(process.cwd(), 'package.json')).gest
} catch (e) {
  // pass
}

exports.getGraphQL = () => GraphQL
exports.getPackageInfo = () => packageInfo
