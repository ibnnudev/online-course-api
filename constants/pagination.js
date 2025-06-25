const {GraphQLInt} = require("graphql/index");
const paginationArgs = {
    limit: {type: GraphQLInt},
    page: {type: GraphQLInt},
}

module.exports = {
    paginationArgs
}