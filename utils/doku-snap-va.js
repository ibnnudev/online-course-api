const crypto = require('crypto');
const axios = require('axios');
const dayjs = require('dayjs');
require('dotenv').config();

const createSnapVA = async ({accessToken, payload}) => {
    const clientId = process.env.DOKU_CLIENT_ID;
    const secretKey = process.env.DOKU_SECRET_KEY;
    const url = process.env.DOKU_SNAP_VA_URL;

    const endpointUrl = '/virtual-accounts/bi-snap-va/v1.1/transfer-va/create-va';
    const httpMethod = 'POST';
    const timestamp = dayjs().format('YYYY-MM-DDTHH:mm:ssZ');
    console.log('timestamp', timestamp);
    const externalId = payload.trxId || Date.now().toString();

    // === Step 1: Minify body ===
    const minifiedBody = JSON.stringify(payload);

    // === Step 2: SHA256 hash of minified body ===
    const hashedBody = crypto.createHash('sha256').update(minifiedBody).digest('hex').toLowerCase();

    // === Step 3: Construct stringToSign ===
    const stringToSign = `${httpMethod}:${endpointUrl}:${accessToken}:${hashedBody}:${timestamp}`;

    // === Step 4: HMAC SHA512 signature ===
    const signature = crypto.createHmac('sha512', secretKey).update(stringToSign).digest('base64');

    const headers = {
        'Content-Type': 'application/json',
        'X-TIMESTAMP': timestamp,
        'X-SIGNATURE': signature,
        'X-PARTNER-ID': clientId,
        'X-EXTERNAL-ID': externalId,
        'CHANNEL-ID': 'H2H',
        Authorization: `Bearer ${accessToken}`,
    };

    console.log('payload', payload);

    try {
        const response = await axios.post(url, payload, {headers});
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data || error.message,
        };
    }
};

module.exports = {createSnapVA};
