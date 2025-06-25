const db = require("../../../models");
const {EnrollmentFields} = require('../fields');
const ResponseHandler = require("../../../utils/response-handler");
const {wrapMutationResolver} = require("../../../utils/wrapper");

const roles = require("../../../constants/roles");
const middlewares = require("../../../middlewares");
const {GraphQLInt, GraphQLString, GraphQLInputObjectType} = require("graphql/type");
const {EnrollmentStatus} = require("../../../constants/enrollment-status");
const {EnrollmentStatusEnum} = require("../../../enums/enrollment-status");
const isAdmin = require("../../../middlewares/require-role")(roles.ADMIN);

module.exports = {
    createEnrollment: {
        type: ResponseHandler,
        args: EnrollmentFields,
        resolve: wrapMutationResolver(
            middlewares(
                [isAdmin],
                async (_, args) => {
                    const enrollment = await db.Enrollment.create(args);
                    return enrollment;
                }
            ), "Enrollment created successfully"
        )
    },
}