const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLInt,
    GraphQLString,
    GraphQLInputObjectType
} = require("graphql");

const paymentStatusEnum = require("../../enums/payment-status");

const createInput = (name, fields) => new GraphQLInputObjectType({name, fields});

const CustomerInputType = createInput("CustomerInput", {
    id: {type: GraphQLString},
    name: {type: GraphQLString},
    phone: {type: GraphQLString},
    country: {type: GraphQLString},
    email: {type: GraphQLString}
});

const OrderInputType = createInput("OrderInput", {
    amount: {type: GraphQLInt},
    invoice_number: {type: GraphQLString},
    currency: {type: GraphQLString},
    callback_url: {type: GraphQLString},
    callback_url_cancel: {type: GraphQLString},
    callback_url_result: {type: GraphQLString}
});

const LineItemInputType = createInput("LineItemInput", {
    id: {type: GraphQLString},
    name: {type: GraphQLString},
    quantity: {type: GraphQLInt},
    price: {type: GraphQLInt},
    sku: {type: GraphQLString},
    category: {type: GraphQLString},
    url: {type: GraphQLString},
    image_url: {type: GraphQLString},
    type: {type: GraphQLString}
});

const AddressInputType = createInput("AddressInput", {
    first_name: {type: GraphQLString},
    last_name: {type: GraphQLString},
    address: {type: GraphQLString},
    city: {type: GraphQLString},
    postal_code: {type: GraphQLString},
    phone: {type: GraphQLString},
    country_code: {type: GraphQLString}
});

const PaymentTypes = new GraphQLObjectType({
    name: "PaymentTypes",
    fields: () => ({
        id: {type: GraphQLID},
        enrollmentId: {type: GraphQLID},
        amount: {type: GraphQLInt},
        currency: {type: GraphQLString},
        paymentMethod: {type: GraphQLString},
        transactionId: {type: GraphQLID},
        paymentStatus: {type: paymentStatusEnum},
        paymentDate: {
            type: GraphQLString,
            resolve: (src) => src.paymentDate ? new Date(src.paymentDate).toISOString() : null,
        },
        createdAt: {
            type: GraphQLString,
            resolve: (src) => src.createdAt ? new Date(src.createdAt).toISOString() : null,
        },
        updatedAt: {
            type: GraphQLString,
            resolve: (src) => src.updatedAt ? new Date(src.updatedAt).toISOString() : null,
        },
        deletedAt: {
            type: GraphQLString,
            resolve: (src) => src.deletedAt ? new Date(src.deletedAt).toISOString() : null,
        },
    })
});

module.exports = {
    CustomerInputType,
    OrderInputType,
    LineItemInputType,
    ShippingAddressInputType: AddressInputType,
    BillingAddressInputType: AddressInputType,
    PaymentTypes
};
