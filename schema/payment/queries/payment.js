const db = require("../../../models");
const ResponseHandler = require("../../../utils/response-handler");
const { wrapQueryResolver } = require("../../../utils/wrapper");

const roles = require("../../../constants/roles");
const middlewares = require("../../../middlewares");
const { GraphQLInt, GraphQLString } = require("graphql/type");
const isAdmin = require("../../../middlewares/require-role")(roles.ADMIN);

module.exports = {
  payment: {
    type: ResponseHandler,
    args: {
      id: { type: GraphQLInt },
      status: { type: GraphQLString },
    },
    resolve: wrapQueryResolver(
      middlewares(
        [isAdmin],
        async (_, { id, status }) => {
          const payment = await db.Payment.findOne({
            where: { id, paymentStatus: status },
            attributes: { exclude: ["deletedAt"] },
          });

          if (!payment) {
            throw new Error("Payment not found or does not match the status");
          }

          return payment;
        },
        "Payment fetched successfully"
      )
    ),
  },
};
