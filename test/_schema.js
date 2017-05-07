const { GraphQLSchema, GraphQLObjectType, GraphQLString } = require('graphql')

module.exports = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      test: {
        type: GraphQLString,
        resolve: () => 'success!'
      }
    }
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      test: {
        type: GraphQLString,
        args: {
          string: { type: GraphQLString }
        },
        resolve: (root, args) => `success ${args.string ? `with args: ${JSON.stringify(args.string)}` : ''}!`
      }
    }
  })
})
