const { GraphQLObjectType, GraphQLSchema } = require("graphql");
const { userQueries, userMutations } = require("./user");
const { courseQueries, courseMutations } = require("./course");

const RootQuery = new GraphQLObjectType({
  name: "RootQuery",
  fields: {
    ...userQueries,
    ...courseQueries,
  },
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    ...userMutations,
    ...courseMutations,
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
