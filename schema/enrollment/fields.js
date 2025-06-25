const {GraphQLID, GraphQLString} = require("graphql/type");
const {EnrollmentStatusEnum} = require("../../enums/enrollment-status");
const EnrollmentFields = {
    id: {type: GraphQLID},
    userId: {type: GraphQLID},
    courseId: {type: GraphQLID},
    enrollmentDate: {type: GraphQLString, resolve: (enrollment) => enrollment.enrollmentDate.toISOString()},
    status: {type: EnrollmentStatusEnum},
}

module.exports = {EnrollmentFields}