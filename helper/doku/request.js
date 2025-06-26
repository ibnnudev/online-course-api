const { log } = require("console");
const crypto = require("crypto");
const fs = require("fs");
const { resolve } = require("path");
require("dotenv").config();

const clientId = process.env.DOKU_CLIENT_ID;
const clientSecret = process.env.DOKU_SECRET_KEY;
const rsaPublicKey = fs.readFileSync(
  resolve(__dirname, "../../keys/public.pem"),
  "utf8"
);

module.exports = {
  generateToken: (request) => {
    const payload = request.body;
    const headers = request.headers;
    const endpoint = request.path;
    const requestMethod = request.method;
    const timestamp = headers["x-timestamp"];
    const accessToken = headers["authorization"]
      ? headers["authorization"].replace("Bearer ", "")
      : "-";

    const minified = JSON.stringify(payload);
    const component = crypto
      .createHash("sha256")
      .update(minified)
      .digest("hex");
    const stringToSign = `${requestMethod}:${endpoint}:${accessToken}:${component.toLowerCase()}:${timestamp}`;
    log.info("String to sign: " + stringToSign);
    return crypto
      .createHmac("sha512", clientSecret)
      .update(stringToSign)
      .digest("base64");
  },

  verifyAsymmetricSignature(headers) {
    const stringToSign = clientId + "|" + (headers["x-timestamp"] || "");

    const verify = crypto.createVerify("RSA-SHA256");
    verify.update(stringToSign);
    verify.end();

    const decodedSignature = Buffer.from(
      headers["x-signature"] || "",
      "base64"
    );
    return verify.verify(rsaPublicKey, decodedSignature);
  },
};
