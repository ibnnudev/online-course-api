const {GraphQLInt} = require("graphql");
const ResponseHandler = require("../../../utils/response-handler");
const {wrapMutationResolver} = require("../../../utils/wrapper");
const roles = require("../../../constants/roles");
const middlewares = require("../../../middlewares");
const isAdmin = require("../../../middlewares/require-role")(roles.ADMIN);
const db = require("../../../models");

module.exports = {
    deletePayment: {
        type: ResponseHandler,
        args: {id: {type: GraphQLInt}},
        resolve: wrapMutationResolver(
            middlewares([isAdmin], async (_, {id}) => {
                const payment = await db.Payment.findByPk(id);
                if (!payment) throw new Error("Payment not found");
                await payment.destroy();
                return {message: "Payment deleted successfully"};
            }),
            "Payment deleted successfully"
        )
    }
};