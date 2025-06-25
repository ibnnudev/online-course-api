const db = require("../../models");
const {PaymentTypes} = require('./types')
const ResponseHandler = require("../../utils/response-handler");
const paginate = require("../../helper/paginate");
const {wrapQueryResolver} = require("../../utils/wrapper");
const PaymentPaginationType = require("../../utils/pagination")("Payment", PaymentTypes);

const roles = require("../../constants/roles");
const middlewares = require("../../middlewares");
const {GraphQLInt, GraphQLString} = require("graphql/type");
const {paginationArgs} = require("../../constants/pagination");
const isAdmin = require("../../middlewares/require-role")(roles.ADMIN);

const paymentQueries = {
    payments: {
        type: PaymentPaginationType,
        args: paginationArgs,
        resolve: wrapQueryResolver(
            middlewares([isAdmin], async (_, args) => {
                const {limit, page, offset} = paginate({
                    limit: args.limit,
                    page: args.page,
                    total: 1,
                })

                const {count: total, rows: payments} = await db.Payment.findAndCountAll({
                    limit,
                    offset
                })

                return {
                    total,
                    limit,
                    offset,
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    data: payments
                }
            }, "Payments retrieved successfully")
        )
    },
    payment: {
        type: ResponseHandler,
        args: {
            id: {type: GraphQLInt},
            status: {type: GraphQLString}
        },
        resolve: wrapQueryResolver(
            middlewares(
                [isAdmin],
                async (_, {id, status}) => {
                    const payment = await db.Payment.findOne({
                        where: {id, paymentStatus: status},
                        attributes: {exclude: ["deletedAt"]}
                    })

                    if (!payment) {
                        throw new Error("Payment not found or does not match the status");
                    }

                    return payment;
                }, "Payment fetched successfully")
        ),
    }
}

module.exports = paymentQueries;