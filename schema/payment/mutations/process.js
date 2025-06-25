const {GraphQLString} = require("graphql");
const {v4: uuidv4} = require("uuid");
const ResponseHandler = require("../../../utils/response-handler");
const {wrapMutationResolver} = require("../../../utils/wrapper");
const db = require("../../../models");
const {buildCustomer, generateLineItems, STATIC_ADDRESS} = require("../../../helper/payment");
const {initiateDokuPayment} = require("../../../services/payment");
const {getExpiredDate} = require("../../../helper/get-expired-date");
const {payment_method_types} = require("../../../constants/payment-method");

module.exports = {
    processPayment: {
        type: ResponseHandler,
        args: {
            enrollmentId: {type: GraphQLString}
        },
        resolve: wrapMutationResolver(async (_, {enrollmentId}) => {
            const enrollment = await db.Enrollment.findOne({
                where: {id: enrollmentId},
                include: [
                    {model: db.User, as: "student"},
                    {model: db.Course, as: "course"}
                ]
            });
            if (!enrollment) throw new Error("Enrollment not found");
            const customer = buildCustomer(enrollment.student);
            const line_items = generateLineItems(enrollment.course);
            const amount = line_items.reduce((total, item) => total + item.price * item.quantity, 0);
            const requestId = uuidv4();
            const data = await initiateDokuPayment({
                requestId,
                amount,
                customer,
                line_items,
                shipping_address: STATIC_ADDRESS,
                billing_address: STATIC_ADDRESS,
            });
            const paymentInfo = data?.response?.payment || {};
            const virtualAccountInfo = data?.response?.virtual_account_info || {};
            const expiredDate = getExpiredDate(paymentInfo);
            await db.Payment.create({
                enrollmentId,
                amount,
                currency: "IDR",
                transactionId: data?.response?.transaction?.transaction_id || requestId,
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
        }, "Payment process initiated")
    }
};