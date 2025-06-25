const {GraphQLObjectType, GraphQLInt, GraphQLList} = require("graphql");
const {GraphQLString, GraphQLBoolean} = require("graphql/type");

function PaginationType(name, itemType) {
    return new GraphQLObjectType({
        name: `${name}Pagination`,
        fields: () => ({
            total: {type: GraphQLInt},
            limit: {type: GraphQLInt},
            offset: {type: GraphQLInt},
            currentPage: {type: GraphQLInt},
            totalPages: {type: GraphQLInt},
            data: {type: new GraphQLList(itemType)},
            message: {type: GraphQLString},
            success: {type: GraphQLBoolean},
        }),
    });
}

module.exports = PaginationType;
