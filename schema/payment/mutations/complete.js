const {GraphQLInt, GraphQLString} = require("graphql");
const ResponseHandler = require("../../../utils/response-handler");
const {wrapMutationResolver} = require("../../../utils/wrapper");
const roles = require("../../../constants/roles");
const middlewares = require("../../../middlewares");
const isAdmin = require("../../../middlewares/require-role")(roles.ADMIN);
const db = require("../../../models");
const paymentStatus = require("../../../constants/payment-status");

module.exports = {
    completePayment: {
        type: ResponseHandler,
        args: {
            id: {type: GraphQLInt},
            status: {type: GraphQLString}
        },
        resolve: wrapMutationResolver(
            middlewares([isAdmin], async (_, {id, status}) => {
                const payment = await db.Payment.findOne({
                    where: {id, paymentStatus: status},
                    attributes: {exclude: ["deletedAt"]}
                });
                if (!payment) throw new Error("Payment not found or does not match the status");
                await payment.update({paymentStatus: paymentStatus.COMPLETED.value});
                return payment;
            }),
            "Payment completed successfully"
        )
    }
};