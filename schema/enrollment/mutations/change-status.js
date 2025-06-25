const db = require("../../../models");
const ResponseHandler = require("../../../utils/response-handler");
const {wrapMutationResolver} = require("../../../utils/wrapper");

const roles = require("../../../constants/roles");
const middlewares = require("../../../middlewares");
const {GraphQLInt} = require("graphql/type");
const {EnrollmentStatus} = require("../../../constants/enrollment-status");
const {EnrollmentStatusEnum} = require("../../../enums/enrollment-status");
const isAdmin = require("../../../middlewares/require-role")(roles.ADMIN);


module.exports = {
    changeStatusEnrollment: {
        type: ResponseHandler,
        args: {
            id: {type: GraphQLInt},
            status: {type: EnrollmentStatusEnum},
        },
        resolve: wrapMutationResolver(
            middlewares(
                [isAdmin],
                async (_, {id, status}) => {
                    const enrollment = await db.Enrollment.findOne({
                        where: {id},
                        attributes: {exclude: ["deletedAt"]}
                    });

                    if (!enrollment) {
                        throw new Error("Enrollment not found");
                    }

                    if (!Object.values(EnrollmentStatus).includes(status)) {
                        throw new Error("Invalid enrollment status");
                    }

                    await enrollment.update({status});
                    return enrollment;
                }
            ), "Enrollment status updated successfully"
        )
    },
}