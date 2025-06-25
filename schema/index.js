const {GraphQLObjectType, GraphQLSchema} = require("graphql");
const {userQueries, userMutations} = require("../schema/user");
const {courseQueries, courseMutations} = require("../schema/course");
const {paymentQueries, paymentMutations} = require("../schema/payment");
const {enrollmentQueries, enrollmentMutations} = require("../schema/enrollment");

const RootQuery = new GraphQLObjectType({
    name: "RootQuery",
    fields: {
        ...userQueries,
        ...courseQueries,
        ...paymentQueries,
        ...enrollmentQueries
    },
});

const Mutation = new GraphQLObjectType({
    name: "Mutation",
    fields: {
        ...userMutations,
        ...courseMutations,
        ...paymentMutations,
        ...enrollmentMutations
    },
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation,
});
