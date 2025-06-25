const crypto = require("crypto");
const {v4: uuidv4} = require("uuid");
const axios = require("axios");

require("dotenv").config();

const db = require("../../models");
const PaymentFields = require('./fields');
const ResponseHandler = require("../../utils/response-handler");
const paginate = require("../../helper/paginate");
const {wrapMutationResolver} = require("../../utils/wrapper");
const paymentStatus = require('../../constants/payment-status')

const roles = require("../../constants/roles");
const middlewares = require("../../middlewares");
const {GraphQLInt, GraphQLString, GraphQLInputObjectType} = require("graphql/type");
const isAdmin = require("../../middlewares/require-role")(roles.ADMIN);

const generateTransactionId = require('../../helper/generate-transaction-id');

// DOKU Helper Functions
function getCurrentTimestamp() {
    return new Date().toISOString().slice(0, 19) + "Z";
}

function generateDigest(jsonBody) {
    let jsonStringHash256 = crypto
        .createHash("sha256")
        .update(jsonBody, "utf-8")
        .digest();
    let bufferFromJsonStringHash256 = Buffer.from(jsonStringHash256);
    return bufferFromJsonStringHash256.toString("base64");
}

function generateSignature(clientId, requestId, requestTimestamp, requestTarget, digest, secret) {
    // Prepare Signature Component
    let componentSignature = "Client-Id:" + clientId;
    componentSignature += "\n";
    componentSignature += "Request-Id:" + requestId;
    componentSignature += "\n";
    componentSignature += "Request-Timestamp:" + requestTimestamp;
    componentSignature += "\n";
    componentSignature += "Request-Target:" + requestTarget;

    console.log(componentSignature);

    if (digest) {
        componentSignature += "\n";
        componentSignature += "Digest:" + digest;
    }

    let hmac256Value = crypto
        .createHmac("sha256", secret)
        .update(componentSignature.toString())
        .digest();

    let bufferFromHmac256Value = Buffer.from(hmac256Value);
    let signature = bufferFromHmac256Value.toString("base64");
    return "HMACSHA256=" + signature;
}

// Define Input Types for DOKU Request
const CustomerInputType = new GraphQLInputObjectType({
    name: 'CustomerInput',
    fields: {
        id: {type: GraphQLString},
        name: {type: GraphQLString},
        phone: {type: GraphQLString},
        country: {type: GraphQLString}
    }
});

const OrderInputType = new GraphQLInputObjectType({
    name: 'OrderInput',
    fields: {
        amount: {type: GraphQLInt},
        invoice_number: {type: GraphQLString},
        currency: {type: GraphQLString},
        callback_url: {type: GraphQLString},
        callback_url_cancel: {type: GraphQLString},
    }
});


const paymentMutations = {
    createPayment: {
        type: ResponseHandler,
        args: PaymentFields,
        resolve: wrapMutationResolver(
            middlewares(
                [isAdmin],
                async (_, args) => {
                    const payment = await db.Payment.create(args);
                    return payment;
                }
            ), "Payment created successfully"
        )
    },
    updatePayment: {
        type: ResponseHandler,
        args: {
            id: {type: GraphQLInt},
            ...PaymentFields
        },
        resolve: wrapMutationResolver(
            middlewares(
                [isAdmin],
                async (_, {id, ...args}) => {
                    const payment = await db.Payment.findByPk(id);
                    if (!payment) {
                        throw new Error("Payment not found");
                    }
                    await payment.update(args);
                    return payment;
                }
            ), "Payment updated successfully"
        )
    },
    completePayment: {
        type: ResponseHandler,
        args: {
            id: {type: GraphQLInt},
            status: {type: GraphQLString}
        },
        resolve: wrapMutationResolver(
            middlewares(
                [isAdmin],
                async (_, {id, status}) => {
                    const payment = await db.Payment.findOne({
                        where: {id, paymentStatus: status},
                        attributes: {exclude: ["deletedAt"]}
                    });

                    if (!payment) {
                        throw new Error("Payment not found or does not match the status");
                    }

                    await payment.update({paymentStatus: paymentStatus.COMPLETED.value});
                    return payment;
                }
            ), "Payment completed successfully"
        )
    },
    deletePayment: {
        type: ResponseHandler,
        args: {
            id: {type: GraphQLInt}
        },
        resolve: wrapMutationResolver(
            middlewares(
                [isAdmin],
                async (_, {id}) => {
                    const payment = await db.Payment.findByPk(id);
                    if (!payment) {
                        throw new Error("Payment not found");
                    }
                    await payment.destroy();
                    return {message: "Payment deleted successfully"};
                }
            ), "Payment deleted successfully"
        )
    },
}

module.exports = paymentMutations;