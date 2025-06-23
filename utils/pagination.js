const { GraphQLObjectType, GraphQLInt, GraphQLList } = require("graphql");

function PaginationType(name, itemType) {
  return new GraphQLObjectType({
    name: `${name}Pagination`,
    fields: () => ({
      total: { type: GraphQLInt },
      limit: { type: GraphQLInt },
      offset: { type: GraphQLInt },
      currentPage: { type: GraphQLInt },
      totalPages: { type: GraphQLInt },
      data: { type: new GraphQLList(itemType) },
    }),
  });
}

module.exports = PaginationType;
