const crypto = require("crypto");

function getCurrentTimestamp() {
    return new Date().toISOString().slice(0, 19) + "Z";
}

function generateDigest(jsonBody) {
    const hash = crypto.createHash("sha256").update(jsonBody, "utf-8").digest();
    return Buffer.from(hash).toString("base64");
}

function generateSignature(clientId, requestId, timestamp, requestTarget, digest, secret) {
    let component = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${timestamp}\nRequest-Target:${requestTarget}`;
    if (digest) component += `\nDigest:${digest}`;
    const hmac = crypto.createHmac("sha256", secret).update(component).digest();
    return "HMACSHA256=" + Buffer.from(hmac).toString("base64");
}

function generateRequestHeaders({clientId, requestId, timestamp, endpoint, body, secret}) {
    const digest = generateDigest(body);
    const signature = generateSignature(clientId, requestId, timestamp, endpoint, digest, secret);

    return {
        "Content-Type": "application/json",
        "Client-Id": clientId,
        "Request-Id": requestId,
        "Request-Timestamp": timestamp,
        "Signature": signature,
        "Digest": `SHA-256=${digest}`
    };
}

module.exports = {
    getCurrentTimestamp,
    generateDigest,
    generateSignature,
    generateRequestHeaders
};
