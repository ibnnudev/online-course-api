const crypto = require("crypto");

exports.verifySignature = (headers, body, clientSecret) => {
  const signature = headers["signature"];
  const method = "POST";
  const endpoint = "/v1/transfer-va/payment";
  const rawBody = typeof body === "string" ? body : JSON.stringify(body);

  const text = `${method}:${endpoint}:${rawBody}`;
  const expectedSignature = crypto
    .createHmac("sha512", clientSecret)
    .update(text)
    .digest("hex");

  return signature === expectedSignature;
};
