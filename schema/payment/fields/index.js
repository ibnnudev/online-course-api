const { GraphQLID, GraphQLInt, GraphQLString } = require("graphql/type");

const paymentStatusEnum = require("../../../enums/payment-status");

const PaymentFields = {
  id: { type: GraphQLID },
  enrollmentId: { type: GraphQLID },
  amount: { type: GraphQLInt },
  currency: { type: GraphQLString },
  paymentMethod: { type: GraphQLString },
  transactionId: { type: GraphQLString },
  status: { type: paymentStatusEnum },
  paymentDate: { type: GraphQLString },

  // ✅ VA-related fields
  partnerServiceId: { type: GraphQLString },
  customerNo: { type: GraphQLString },
  virtualAccountTrxType: { type: GraphQLString },
  virtualAccountNo: { type: GraphQLString },

  howToPayUrl: { type: GraphQLString },
  howToPayApi: { type: GraphQLString },

  // ✅ Customer details
  customerName: { type: GraphQLString },
  customerEmail: { type: GraphQLString },
  customerPhone: { type: GraphQLString },

  expiredDate: { type: GraphQLString },
};

module.exports = PaymentFields;
