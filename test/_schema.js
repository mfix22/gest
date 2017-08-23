const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLNonNull
} = require('graphql')

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
      updateUser: {
        type: GraphQLString,
        args: {
          email: { type: GraphQLString },
          phone: { type: GraphQLInt },
          isValid: { type: GraphQLBoolean }
        },
        resolve: (root, args) => `success${Object.assign(args).length ? ` with args: ${JSON.stringify(args)}` : ''}!`
      },
      setLogLevel: {
        type: GraphQLFloat,
        args: {
          input: { type: new GraphQLNonNull(GraphQLBoolean) }
        },
        resolve: (root, args) => `success${Object.assign(args).length ? ` with args: ${JSON.stringify(args)}` : ''}!`
      }
    }
  })
})
