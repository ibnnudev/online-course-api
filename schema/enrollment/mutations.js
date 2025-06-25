const db = require("../../models");
const {EnrollmentFields} = require('./fields');
const ResponseHandler = require("../../utils/response-handler");
const {wrapMutationResolver} = require("../../utils/wrapper");

const roles = require("../../constants/roles");
const middlewares = require("../../middlewares");
const {GraphQLInt, GraphQLString, GraphQLInputObjectType} = require("graphql/type");
const {EnrollmentStatus} = require("../../constants/enrollment-status");
const {EnrollmentStatusEnum} = require("../../enums/enrollment-status");
const isAdmin = require("../../middlewares/require-role")(roles.ADMIN);

const enrollmentMutations = {
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
    deleteEnrollment: {
        type: ResponseHandler,
        args: {
            id: {type: GraphQLInt}
        },
        resolve: wrapMutationResolver(
            middlewares(
                [isAdmin],
                async (_, {id}) => {
                    const enrollment = await db.Enrollment.findByPk(id);
                    if (!enrollment) {
                        throw new Error("Enrollment not found");
                    }
                    await enrollment.destroy();
                    return {message: "Enrollment deleted successfully"};
                }
            ), "Enrollment deleted successfully"
        )
    }
}

module.exports = enrollmentMutations;