const fs = require('fs');
const path = require('path');
const axios = require('axios');
const crypto = require('crypto');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');

dayjs.extend(utc);

require('dotenv').config();

const getDokuAccessToken = async () => {
    try {
        const clientId = process.env.DOKU_CLIENT_ID;
        const privateKeyPath = path.resolve(__dirname, '../keys/private.pem');
        const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

        const timestamp = dayjs().utc().format('YYYY-MM-DDTHH:mm:ss[Z]');
        const stringToSign = `${clientId}|${timestamp}`;

        // Create signature with SHA256withRSA
        const sign = crypto.createSign('RSA-SHA256');
        sign.update(stringToSign);
        sign.end();
        const signature = sign.sign(privateKey, 'base64');

        const headers = {
            'Content-Type': 'application/json',
            'X-SIGNATURE': signature,
            'X-TIMESTAMP': timestamp,
            'X-CLIENT-KEY': clientId,
        };

        const body = {
            grantType: 'client_credentials',
        };

        const url = 'https://api-sandbox.doku.com/authorization/v1/access-token/b2b';

        const response = await axios.post(url, body, {headers});

        return {
            success: true,
            token: response.data.accessToken,
            expiresIn: response.data.expiresIn,
            raw: response.data,
        };
    } catch (error) {
        console.error('❌ Error getting DOKU token:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data || error.message,
        };
    }
};

module.exports = {getDokuAccessToken};
