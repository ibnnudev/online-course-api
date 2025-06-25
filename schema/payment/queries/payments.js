const {GraphQLInt} = require("graphql");
const db = require("../../../models");
const {PaymentTypes} = require("../mutations/payment/fields");
const paginate = require("../../../helper/paginate");
const {wrapQueryResolver} = require("../../../utils/wrapper");
const PaymentPaginationType = require("../../../utils/pagination")("Payment", PaymentTypes);
const roles = require("../../../constants/roles");
const middlewares = require("../../../middlewares");
const {paginationArgs} = require("../../../constants/pagination");
const isAdmin = require("../../../middlewares/require-role")(roles.ADMIN);

module.exports = {
    payments: {
        type: PaymentPaginationType,
        args: paginationArgs,
        resolve: wrapQueryResolver(
            middlewares([isAdmin], async (_, args) => {
                const {limit, page, offset} = paginate({
                    limit: args.limit,
                    page: args.page,
                    total: 1
                });

                const {count: total, rows: payments} = await db.Payment.findAndCountAll({
                    limit,
                    offset
                });

                return {
                    total,
                    limit,
                    offset,
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    data: payments
                };
            }, "Payments retrieved successfully")
        )
    }
};