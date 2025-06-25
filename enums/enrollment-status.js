const {GraphQLEnumType} = require("graphql/type");
const {EnrollmentStatus} = require("../constants/enrollment-status");

const EnrollmentStatusEnum = new GraphQLEnumType({
    name: "EnrollmentStatus",
    values: EnrollmentStatus
})

module.exports = {EnrollmentStatusEnum};