const crypto = require("crypto");
const axios = require("axios");
require("dotenv").config();

const paymentNotification = async ({ accessToken, channelId, payload }) => {
  const clientId = process.env.DOKU_CLIENT_ID;
  const secretKey = process.env.DOKU_SECRET_KEY;
  const url = process.env.DOKU_PAYMENT_NOTIFICATION_URL;

  console.log("Doku Payment Notification URL:", url);

  const endpointUrl = "/v1/transfer-va/payment";
  const httpMethod = "POST";
  const timestamp = new Date().toISOString(); // UTC timestamp
  const externalId = `${payload.trxId}-${Date.now()}`; // Unik di hari yang sama

  const minifiedBody = JSON.stringify(payload);
  const hashedBody = crypto
    .createHash("sha256")
    .update(minifiedBody)
    .digest("hex")
    .toLowerCase();

  const stringToSign = `${httpMethod}:${endpointUrl}:${accessToken}:${hashedBody}:${timestamp}`;
  const signature = crypto
    .createHmac("sha512", secretKey)
    .update(stringToSign)
    .digest("base64");

  const headers = {
    "Content-Type": "application/json",
    "X-TIMESTAMP": timestamp,
    "X-SIGNATURE": signature,
    "X-PARTNER-ID": clientId,
    "X-EXTERNAL-ID": externalId,
    "CHANNEL-ID": "H2H",
    Authorization: `Bearer ${accessToken}`,
  };

  console.log("Headers:", headers);
  console.log("Payload:", payload);
  console.log("URL:", url);

  try {
    const response = await axios.post(url, payload, { headers });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error(
      "Payment notification error:",
      error?.response.error || error.message
    );
    return {
      success: false,
      error: error?.response?.data || error.message,
    };
  }
};

module.exports = { paymentNotification };
