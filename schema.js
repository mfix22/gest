const { GraphQLSchema, GraphQLObjectType, GraphQLString } = require('graphql')

module.exports = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      _test: {
        type: GraphQLString,
        resolve: () => 'success!'
      }
    }
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      _test: {
        type: GraphQLString,
        resolve: () => 'success!'
      }
    }
  })
})
