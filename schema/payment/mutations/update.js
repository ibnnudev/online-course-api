const {GraphQLInt} = require("graphql");
const ResponseHandler = require("../../../utils/response-handler");
const {wrapMutationResolver} = require("../../../utils/wrapper");
const roles = require("../../../constants/roles");
const middlewares = require("../../../middlewares");
const isAdmin = require("../../../middlewares/require-role")(roles.ADMIN);
const db = require("../../../models");
const PaymentFields = require("../fields");

module.exports = {
    updatePayment: {
        type: ResponseHandler,
        args: {
            id: {type: GraphQLInt},
            ...PaymentFields
        },
        resolve: wrapMutationResolver(
            middlewares([isAdmin], async (_, {id, ...args}) => {
                const payment = await db.Payment.findByPk(id);
                if (!payment) throw new Error("Payment not found");
                await payment.update(args);
                return payment;
            }),
            "Payment updated successfully"
        )
    }
};