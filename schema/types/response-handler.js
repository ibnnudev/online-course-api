const { GraphQLObjectType, GraphQLBoolean, GraphQLString } = require("graphql");
const { default: GraphQLJSON } = require("graphql-type-json");

const GenericResponseType = new GraphQLObjectType({
  name: "ResponseHandler",
  fields: () => ({
    success: { type: GraphQLBoolean },
    message: { type: GraphQLString },
    data: { type: GraphQLJSON },
  }),
});

module.exports = GenericResponseType;
