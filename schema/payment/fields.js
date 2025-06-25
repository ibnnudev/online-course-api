const {
    GraphQLID,
    GraphQLInt,
    GraphQLString,
} = require("graphql/type");
const paymentStatusEnum = require("../../enums/payment-status");
const generateTransactionId = require('../../helper/generate-transaction-id');

const PaymentFields = {
    id: {type: GraphQLID},
    enrollmentId: {type: GraphQLID},
    amount: {type: GraphQLInt},
    currency: {type: GraphQLString},
    paymentMethod: {type: GraphQLString},
    transactionId: {type: GraphQLString},
    status: {type: paymentStatusEnum},
    paymentDate: {type: GraphQLString},

    // DOKU VA ATTRIBUTES
    virtualAccountNo: {type: GraphQLString},
    howToPayUrl: {type: GraphQLString},
    customerName: {type: GraphQLString},
    customerEmail: {type: GraphQLString},
    customerPhone: {type: GraphQLString},
    expiredDate: {type: GraphQLString},
};

module.exports = PaymentFields;
