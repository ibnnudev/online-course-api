const ResponseHandler = require("../../../utils/response-handler");
const {wrapMutationResolver} = require("../../../utils/wrapper");
const roles = require("../../../constants/roles");
const middlewares = require("../../../middlewares");
const isAdmin = require("../../../middlewares/require-role")(roles.ADMIN);
const db = require("../../../models");
const PaymentFields = require("../fields");

module.exports = {
    createPayment: {
        type: ResponseHandler,
        args: PaymentFields,
        resolve: wrapMutationResolver(
            middlewares([isAdmin], async (_, args) => {
                const payment = await db.Payment.create(args);
                return payment;
            }),
            "Payment created successfully"
        )
    }
};