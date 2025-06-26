const { GraphQLString } = require("graphql");
const { v4: uuidv4 } = require("uuid");
const dayjs = require("dayjs");
const ResponseHandler = require("../../../utils/response-handler");
const { wrapMutationResolver } = require("../../../utils/wrapper");
const db = require("../../../models");
const { buildCustomer, generateLineItems } = require("../../../helper/payment");
const { getDokuAccessToken } = require("../../../utils/doku-get-token");
const { createSnapVA } = require("../../../utils/doku-snap-va");
const {
  VIRTUAL_ACCOUNT_BRI,
} = require("../../../constants/virtual-account-snap");

module.exports = {
  generateVA: {
    type: ResponseHandler,
    args: {
      enrollmentId: { type: GraphQLString },
    },
    resolve: wrapMutationResolver(async (_, { enrollmentId }) => {
      const enrollment = await db.Enrollment.findOne({
        where: { id: enrollmentId },
        include: [
          { model: db.User, as: "student" },
          { model: db.Course, as: "course" },
        ],
      });
      if (!enrollment) throw new Error("Enrollment not found");
      const customer = buildCustomer(enrollment.student);
      const line_items = generateLineItems(enrollment.course);
      const amount = line_items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      const trxId = uuidv4();
      const token = await getDokuAccessToken();
      if (!token.success) throw new Error("Failed to get Doku access token");
      const payload = {
        partnerServiceId: VIRTUAL_ACCOUNT_BRI.partnerServiceId,
        customerNo: VIRTUAL_ACCOUNT_BRI.customerNo,
        virtualAccountNo: VIRTUAL_ACCOUNT_BRI.virtualAccountNo,
        virtualAccountName: customer.name,
        virtualAccountEmail: customer.email,
        virtualAccountPhone: customer.phone.replace(/^0/, "62"),
        trxId,
        totalAmount: {
          value: amount.toFixed(2),
          currency: "IDR",
        },
        additionalInfo: {
          channel: VIRTUAL_ACCOUNT_BRI.channel,
          // override_notification_url:
          //   "https://0282a7660c4343.lhr.life/v1/transfer-va/payment",
        },
        virtualAccountTrxType: VIRTUAL_ACCOUNT_BRI.virtualAccountTrxType,
        expiredDate: dayjs().add(1, "day").format("YYYY-MM-DDTHH:mm:ssZ"),
        freeText: [
          { english: "Course payment", indonesia: "Pembayaran kursus" },
        ],
      };
      const result = await createSnapVA({ accessToken: token.token, payload });
      if (!result.success) throw new Error("Failed to create Snap VA");
      const vaData = result.data.virtualAccountData;
      await db.Payment.create({
        enrollmentId,
        amount,
        currency: payload.totalAmount.currency,
        partnerServiceId: vaData.partnerServiceId, // ✅ NEW
        customerNo: vaData.customerNo, // ✅ NEW
        virtualAccountTrxType: vaData.virtualAccountTrxType, // ✅ NEW
        paymentMethod: payload.additionalInfo.channel,
        transactionId: trxId,
        virtualAccountNo: vaData.virtualAccountNo,
        howToPayUrl: vaData.additionalInfo.howToPayPage,
        howToPayApi: vaData.additionalInfo.howToPayApi, // ✅ NEW
        customerName: vaData.virtualAccountName,
        customerEmail: vaData.virtualAccountEmail,
        customerPhone: vaData.virtualAccountPhone,
        expiredDate: dayjs(vaData.expiredDate, "YYYY-MM-DDTHH:mm:ssZ").toDate(), // Adjusted parsing for Z
      });

      return result;
    }, "Payment process with VA initiated"),
  },
};
