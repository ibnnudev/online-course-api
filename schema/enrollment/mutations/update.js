const db = require("../../../models");
const {EnrollmentFields} = require('../fields');
const ResponseHandler = require("../../../utils/response-handler");
const {wrapMutationResolver} = require("../../../utils/wrapper");

const roles = require("../../../constants/roles");
const middlewares = require("../../../middlewares");
const {GraphQLInt} = require("graphql/type");
const isAdmin = require("../../../middlewares/require-role")(roles.ADMIN);

module.exports = {
    updateEnrollment: {
        type: ResponseHandler,
        args: {
            id: {type: GraphQLInt},
            ...EnrollmentFields
        },
        resolve: wrapMutationResolver(
            middlewares(
                [isAdmin],
                async (_, {id, ...args}) => {
                    const enrollment = await db.Enrollment.findByPk(id);
                    if (!enrollment) {
                        throw new Error("Enrollment not found");
                    }
                    await enrollment.update(args);
                    return enrollment;
                },
                "Enrollment updated successfully")
        )
    },
}