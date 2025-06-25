const {GraphQLString} = require("graphql");
const {v4: uuidv4} = require("uuid");
const dayjs = require("dayjs");
const ResponseHandler = require("../../../utils/response-handler");
const {wrapMutationResolver} = require("../../../utils/wrapper");
const db = require("../../../models");
const {buildCustomer, generateLineItems} = require("../../../helper/payment");
const {getDokuAccessToken} = require("../../../utils/doku-get-token");
const {createSnapVA} = require("../../../utils/doku-snap-va");

module.exports = {
    processPaymentWithVA: {
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
            const trxId = uuidv4();
            const token = await getDokuAccessToken();
            if (!token.success) throw new Error("Failed to get Doku access token");
            const payload = {
                partnerServiceId: '13925',
                customerNo: '6',
                virtualAccountNo: '139256',
                virtualAccountName: customer.name,
                virtualAccountEmail: customer.email,
                virtualAccountPhone: customer.phone.replace(/^0/, "62"),
                trxId,
                totalAmount: {
                    value: amount.toFixed(2),
                    currency: "IDR"
                },
                additionalInfo: {
                    channel: "VIRTUAL_ACCOUNT_BRI"
                },
                virtualAccountTrxType: "C",
                expiredDate: dayjs().add(1, 'day').format('YYYY-MM-DDTHH:mm:ssZ'),
                freeText: [{english: "Course payment", indonesia: "Pembayaran kursus"}]
            };
            const result = await createSnapVA({accessToken: token.token, payload});
            if (!result.success) throw new Error("Failed to create Snap VA");
            const vaData = result.data.virtualAccountData;
            return await db.Payment.create({
                enrollmentId,
                amount,
                currency: payload.totalAmount.currency,
                paymentMethod: payload.additionalInfo.channel,
                transactionId: trxId,
                virtualAccountNo: vaData.virtualAccountNo.trim(),
                howToPayUrl: vaData.additionalInfo.howToPayPage,
                customerName: vaData.virtualAccountName,
                customerEmail: vaData.virtualAccountEmail,
                customerPhone: vaData.virtualAccountPhone,
                expiredDate: dayjs(vaData.expiredDate, 'YYYYMMDDHHmmss').toDate()
            });
        }, "Payment process with VA initiated")
    }
};