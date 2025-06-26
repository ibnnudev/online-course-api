const { GraphQLInt, GraphQLString } = require("graphql");
const ResponseHandler = require("../../../utils/response-handler");
const { wrapMutationResolver } = require("../../../utils/wrapper");
const roles = require("../../../constants/roles");
const middlewares = require("../../../middlewares");
const isAdmin = require("../../../middlewares/require-role")(roles.ADMIN);
const db = require("../../../models");
const paymentStatus = require("../../../constants/payment-status");
const { getDokuAccessToken } = require("../../../utils/doku-get-token");
const {
  VIRTUAL_ACCOUNT_BRI,
} = require("../../../constants/virtual-account-snap");
const {
  paymentNotification,
} = require("../../../utils/doku-payment-notification");

module.exports = {
  completePayment: {
    type: ResponseHandler,
    args: {
      id: { type: GraphQLString },
    },
    resolve: wrapMutationResolver(
      middlewares([isAdmin], async (_, { id }) => {
        const payment = await db.Payment.findByPk(id);
        if (!payment) {
          throw new Error("Payment not found or does not match the status");
        }

        // It's good practice to ensure the payment is in a 'pending' state before attempting to complete it.
        // You might want to add a check like:
        // if (payment.status !== paymentStatus.PENDING) {
        //   throw new Error("Payment is not in a pending state and cannot be completed.");
        // }

        const token = await getDokuAccessToken();
        if (!token.success) {
          throw new Error("Failed to get Doku access token");
        }

        const payload = {
          partnerServiceId:
            payment.partnerServiceId || VIRTUAL_ACCOUNT_BRI.partnerServiceId,
          customerNo:
            payment.partnerServiceId.replace(/ /g, "") + +payment.customerNo,
          virtualAccountNo:
            payment.partnerServiceId.replace(/ /g, "0") + payment.customerNo,
          virtualAccountName: payment.customerName,
          trxId: payment.transactionId,
          //   paymentRequestId: payment.transactionId,
          //   paidAmount: {
          //     value: parseFloat(payment.amount).toFixed(2),
          //     currency: payment.currency || "IDR",
          //   },
          virtualAccountEmail: payment.customerEmail,
          virtualAccountPhone: payment.customerPhone?.replace(/^0/, "62"),
        };

        const result = await paymentNotification({
          accessToken: token?.token,
          channelId: payment.paymentMethod,
          payload,
        });

        if (!result.success) {
          console.error("Failed to complete payment:", result.error);
          throw new Error("Failed to complete payment: " + result.error);
        }

        await db.Payment.update(
          {
            status: paymentStatus.COMPLETED,
            paymentDate: new Date(),
            updatedAt: new Date(),
          },
          { where: { id: payment.id } }
        );

        console.log("Payment completed successfully:", result.data);
      }),
      "Payment completed successfully"
    ),
  },
};
