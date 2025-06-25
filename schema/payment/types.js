const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLInt,
    GraphQLString,
} = require("graphql/type");
const paymentStatusEnum = require("../../enums/payment-status");

const PaymentTypes = new GraphQLObjectType({
    name: "PaymentTypes",
    description: "type of services",
    fields: () => ({
        id: {type: GraphQLID},
        enrollmentId: {
            type: GraphQLID,
            description: "ID of the enrollment associated with this services",
        },
        amount: {type: GraphQLInt, description: "Amount of the services"},
        currency: {
            type: GraphQLString,
        },
        paymentMethod: {
            type: GraphQLString,
        },
        transactionId: {type: GraphQLID},
        paymentStatus: {
            type: paymentStatusEnum,
        },
        paymentDate: {
            type: GraphQLString,
            description: "Date when the services was made",
            resolve: (source) => {
                return source.paymentDate
                    ? new Date(source.paymentDate).toISOString()
                    : null;
            },
        },
        createdAt: {
            type: GraphQLString,
            description: "Date when the services created",
            resolve: (source) => {
                return source.createdAt
                    ? new Date(source.createdAt).toISOString()
                    : null;
            },
        },
        updatedAt: {
            type: GraphQLString,
            description: "Date when the services updated",
            resolve: (source) => {
                return source.createdAt
                    ? new Date(source.createdAt).toISOString()
                    : null;
            },
        },
        deletedAt: {
            type: GraphQLString,
            description: "Date when the services was deleted",
            resolve: (source) => {
                return source.deletedAt
                    ? new Date(source.deletedAt).toISOString()
                    : null;
            },
        },
    }),
});

module.exports = PaymentTypes;
