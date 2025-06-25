const paymentStatus = require('../constants/payment-status');
const {GraphQLEnumType} = require('graphql')

const PaymentStatusEnum = new GraphQLEnumType({
    name: "PaymentStatus",
    values: paymentStatus
})

module.exports = PaymentStatusEnum;