const axios = require("axios");
const {
  generateRequestHeaders,
  getCurrentTimestamp,
} = require("../utils/doku-signature");
const { payment_method_types } = require("../constants/payment-method");
const { v4: uuidv4 } = require("uuid");

const generateInvoiceNumber = (timestamp) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const uniqueId = uuidv4().replace(/-/g, "").slice(0, 8);

  return `INV${year}${month}${day}${uniqueId}`;
};

async function initiateDokuPayment({
  requestId,
  amount,
  customer,
  line_items,
  shipping_address,
  billing_address,
}) {
  const DOKU_CLIENT_ID = process.env.DOKU_CLIENT_ID;
  const DOKU_SECRET_KEY = process.env.DOKU_SECRET_KEY;

  const endpoint = "/checkout/v1/payment";
  const apiUrl = `https://api-sandbox.doku.com${endpoint}`;
  const timestamp = getCurrentTimestamp();

  const invoiceNumber = generateInvoiceNumber(timestamp);

  const requestBody = {
    order: {
      amount,
      invoice_number: invoiceNumber,
      currency: "IDR",
      callback_url: "https://yourdomain.com/payment/success",
      callback_url_cancel: "https://yourdomain.com/payment/cancel",
      callback_url_result: "https://yourdomain.com/payment/result",
      auto_redirect: true,
      line_items,
    },
    payment: {
      payment_due_date: 60,
      payment_method_types,
    },
    customer,
    shipping_address,
    billing_address,
  };

  try {
    const headers = generateRequestHeaders({
      clientId: DOKU_CLIENT_ID,
      requestId,
      timestamp,
      endpoint,
      body: JSON.stringify(requestBody),
      secret: DOKU_SECRET_KEY,
    });

    const { data } = await axios.post(apiUrl, requestBody, { headers });
    return data;
  } catch (error) {
    const errorMessage = error.response?.data || error.message;
    console.error("DOKU Payment Error:", errorMessage);

    throw new Error(
      `Failed to initiate DOKU payment: ${JSON.stringify(errorMessage)}`
    );
  }
}

module.exports = {
  initiateDokuPayment,
};
