const {GraphQLObjectType, GraphQLString, GraphQLID} = require("graphql/type");
const {EnrollmentStatusEnum} = require("../../enums/enrollment-status");

const EnrollmentType = new GraphQLObjectType({
    name: "Enrollment",
    fields: () => ({
        id: {type: GraphQLID},
        userId: {type: GraphQLID},
        courseId: {type: GraphQLID},
        enrollmentDate: {
            type: GraphQLString,
            resolve: (enrollment) => enrollment.enrollmentDate.toISOString()
        },
        status: {type: EnrollmentStatusEnum},
        createdAt: {
            type: GraphQLString,
            resolve: (enrollment) => enrollment.createdAt.toISOString()
        },
        updatedAt: {
            type: GraphQLString,
            resolve: (enrollment) => enrollment.updatedAt.toISOString()
        },
        deletedAt: {
            type: GraphQLString,
            resolve: (enrollment) => enrollment.deletedAt ? enrollment.deletedAt.toISOString() : null
        }
    })
})

module.exports = EnrollmentType
