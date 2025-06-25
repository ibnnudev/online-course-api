const {GraphQLID, GraphQLString} = require("graphql");

const db = require("../../../models");
const ResponseHandler = require("../../../utils/response-handler");
const {wrapMutationResolver} = require("../../../utils/wrapper");
const {hashPassword, comparePassword} = require("../../../utils/bcrypt");
const generateToken = require("../../../helper/generate-token");

const UserFields = require("../fields");

const roles = require("../../../constants/roles");
const middlewares = require("../../../middlewares");
const isAdmin = require("../../../middlewares/require-role")(roles.ADMIN);

module.exports = {
    updateUser: {
        type: ResponseHandler,
        args: {
            id: {type: GraphQLID},
            ...UserFields,
        },
        resolve: wrapMutationResolver(
            middlewares([isAdmin], async (_, args) => {
                const user = await db.User.findByPk(args.id);
                if (!user) throw new Error("User not found");

                if (args.password) {
                    args.password = await hashPassword(args.password);
                }

                return await user.update(args);
            }),
            "User updated successfully"
        ),
    },
}