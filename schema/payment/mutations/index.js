const {v4: uuidv4} = require("uuid");
require("dotenv").config();

const db = require("../../../models");
const ResponseHandler = require("../../../utils/response-handler");
const {wrapMutationResolver} = require("../../../utils/wrapper");
const paymentStatus = require('../../../constants/payment-status')

const roles = require("../../../constants/roles");
const middlewares = require("../../../middlewares");

const dayjs = require("dayjs");

const {
    GraphQLInt,
    GraphQLString,
} = require("graphql");

const isAdmin = require("../../../middlewares/require-role")(roles.ADMIN);
const {buildCustomer, generateLineItems, STATIC_ADDRESS} = require("../../../helper/payment");
const {initiateDokuPayment} = require("../../../services/payment");

const PaymentFields = require("../fields");
const {payment_method_types} = require("../../../constants/payment-method");
const {getExpiredDate} = require("../../../helper/get-expired-date");
const {getDokuAccessToken} = require("../../../utils/doku-get-token");
const {createSnapVA} = require("../../../utils/doku-snap-va");

const paymentMutations = {
    createPayment: {
        type: ResponseHandler,
        args: PaymentFields,
        resolve: wrapMutationResolver(
            middlewares(
                [isAdmin],
                async (_, args) => {
                    const createdPayment = await db.Payment.create(args);
                    return createdPayment;
                }
            ), "Payment created successfully"
        )
    },
    updatePayment: {
        type: ResponseHandler,
        args: {
            id: {type: GraphQLInt},
            ...PaymentFields
        },
        resolve: wrapMutationResolver(
            middlewares(
                [isAdmin],
                async (_, {id, ...args}) => {
                    const payment = await db.Payment.findByPk(id);
                    if (!payment) {
                        throw new Error("Payment not found");
                    }
                    await payment.update(args);
                    return payment;
                }
            ), "Payment updated successfully"
        )
    },
    completePayment: {
        type: ResponseHandler,
        args: {
            id: {type: GraphQLInt},
            status: {type: GraphQLString}
        },
        resolve: wrapMutationResolver(
            middlewares(
                [isAdmin],
                async (_, {id, status}) => {
                    const payment = await db.Payment.findOne({
                        where: {id, paymentStatus: status},
                        attributes: {exclude: ["deletedAt"]}
                    });

                    if (!payment) {
                        throw new Error("Payment not found or does not match the status");
                    }

                    await payment.update({paymentStatus: paymentStatus.COMPLETED.value});
                    return payment;
                }
            ), "Payment completed successfully"
        )
    },
    deletePayment: {
        type: ResponseHandler,
        args: {
            id: {type: GraphQLInt}
        },
        resolve: wrapMutationResolver(
            middlewares(
                [isAdmin],
                async (_, {id}) => {
                    const payment = await db.Payment.findByPk(id);
                    if (!payment) {
                        throw new Error("Payment not found");
                    }
                    await payment.destroy();
                    return {message: "Payment deleted successfully"};
                }
            ), "Payment deleted successfully"
        )
    },
    processPayment: {
        type: ResponseHandler,
        args: {
            enrollmentId: {type: GraphQLString},
        },
        resolve: wrapMutationResolver(
            async (_, {enrollmentId}) => {
                const enrollment = await db.Enrollment.findOne({
                    where: {id: enrollmentId},
                    include: [
                        {model: db.User, as: "student"},
                        {model: db.Course, as: "course"}
                    ]
                });

                if (!enrollment) throw new Error("Enrollment not found");

                const user = enrollment.student;
                const course = enrollment.course;

                const customer = buildCustomer(user);
                const line_items = generateLineItems(course);
                const totalFromLineItems = line_items.reduce((total, item) => {
                    return total + item.price * item.quantity;
                }, 0);
                const amount = totalFromLineItems;

                const requestId = uuidv4();

                const data = await initiateDokuPayment({
                    requestId,
                    amount,
                    customer,
                    line_items,
                    shipping_address: STATIC_ADDRESS,
                    billing_address: STATIC_ADDRESS,
                });

                const paymentResponse = data?.response || {};
                const paymentInfo = paymentResponse?.payment || {};
                const virtualAccountInfo = paymentResponse?.virtual_account_info || {};
                const expiredDate = getExpiredDate(paymentInfo);

                await db.Payment.create({
                    enrollmentId,
                    amount,
                    currency: "IDR",
                    transactionId: paymentResponse?.transaction?.transaction_id || requestId,
                    status: "pending",
                    virtualAccountNo: virtualAccountInfo?.virtual_account_number || null,
                    howToPayUrl: paymentInfo?.url || null,
                    customerName: customer.name,
                    customerEmail: customer.email,
                    customerPhone: customer.phone,
                    paymentMethod: payment_method_types.join(","),
                    expiredDate
                });

                return {
                    success: true,
                    message: "Payment URL created",
                    data
                };
            },
            "Payment process initiated"
        )
    },
    processPaymentWithVA: {
        type: ResponseHandler,
        args: {
            enrollmentId: {type: GraphQLString},
        },
        resolve: wrapMutationResolver(
            async (_, {enrollmentId}) => {
                const enrollment = await db.Enrollment.findOne({
                    where: {id: enrollmentId},
                    include: [
                        {model: db.User, as: "student"},
                        {model: db.Course, as: "course"}
                    ]
                });

                if (!enrollment) throw new Error("Enrollment not found");

                const user = enrollment.student;
                const course = enrollment.course;

                const customer = buildCustomer(user);
                const line_items = generateLineItems(course);
                const totalFromLineItems = line_items.reduce((total, item) => {
                    return total + item.price * item.quantity;
                }, 0);
                const amount = totalFromLineItems;

                const requestId = uuidv4();

                const token = await getDokuAccessToken();
                if (!token.success) {
                    throw new Error('Failed to get Doku access token');
                }
                const trxId = requestId;
                const payload = {
                    partnerServiceId: '   13925',
                    customerNo: '6',
                    virtualAccountNo: '   139256',
                    virtualAccountName: customer.name,
                    virtualAccountEmail: customer.email,
                    virtualAccountPhone: customer.phone.replace(/^0/, "62"),
                    trxId,
                    totalAmount: {
                        value: amount.toFixed(2),
                        currency: "IDR"
                    },
                    additionalInfo: {
                        channel: "VIRTUAL_ACCOUNT_BRI",
                        // virtualAccountConfig: {
                        //     reusableStatus: true,
                        //     minAmount: "10000.00",
                        //     maxAmount: "5000000.00"
                        // }
                    },
                    virtualAccountTrxType: "C",
                    expiredDate: dayjs().add(1, 'day').format('YYYY-MM-DDTHH:mm:ssZ'),
                    freeText: [
                        {
                            english: "Course payment",
                            indonesia: "Pembayaran kursus"
                        }
                    ]
                }

                const result = await createSnapVA({
                    accessToken: token?.token,
                    payload
                });

                if (!result.success) {
                    console.error(result)
                }

                const paymentResponse = result.data || {};

                return await db.Payment.create({
                    enrollmentId,
                    amount,
                    currency: payload.totalAmount.currency,
                    paymentMethod: payload.additionalInfo.channel,
                    transactionId: trxId,
                    virtualAccountNo: paymentResponse.virtualAccountData.virtualAccountNo.trim(),
                    howToPayUrl: paymentResponse.virtualAccountData.additionalInfo.howToPayPage,
                    customerName: paymentResponse.virtualAccountData.virtualAccountName,
                    customerEmail: paymentResponse.virtualAccountData.virtualAccountEmail,
                    customerPhone: paymentResponse.virtualAccountData.virtualAccountPhone,
                    expiredDate: dayjs(paymentResponse.virtualAccountData.expiredDate, 'YYYYMMDDHHmmss').toDate()
                })

            },
            "Payment process with VA initiated"
        )

    }
};

module.exports = paymentMutations;