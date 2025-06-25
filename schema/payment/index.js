module.exports = {
    ...require("./mutations/create"),
    ...require("./mutations/update"),
    ...require("./mutations/delete"),
    ...require("./mutations/pay-va"),
    ...require("./mutations/process"),
    ...require("./mutations/complete"),
};
