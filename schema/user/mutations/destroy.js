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
    destroyUser: {
        type: ResponseHandler,
        args: {id: {type: GraphQLString}},
        resolve: wrapMutationResolver(async (_, {id}) => {
            const user = await db.User.findByPk(id);
            if (!user) throw new Error("User not found");

            await user.destroy();
            return null;
        }, "User deleted successfully"),
    },
}