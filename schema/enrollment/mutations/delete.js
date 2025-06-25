const db = require("../../../models");
const ResponseHandler = require("../../../utils/response-handler");
const {wrapMutationResolver} = require("../../../utils/wrapper");

const roles = require("../../../constants/roles");
const middlewares = require("../../../middlewares");
const {GraphQLInt} = require("graphql/type");
const isAdmin = require("../../../middlewares/require-role")(roles.ADMIN);

module.exports = {
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