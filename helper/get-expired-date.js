const dayjs = require("dayjs");
const getExpiredDate = (paymentInfo) => {
    return paymentInfo?.expired_date ? dayjs(paymentInfo.expired_date, 'YYYYMMDDHHmmss').toDate() : null;
}

module.exports = {getExpiredDate};