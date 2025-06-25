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
    login: {
        type: ResponseHandler,
        args: {
            username: {type: GraphQLString},
            password: {type: GraphQLString},
        },
        resolve: wrapMutationResolver(
            middlewares([], async (_, args) => {
                const user = await db.User.findOne({
                    where: {username: args.username},
                });
                if (!user) throw new Error("User not found");

                const isPasswordValid = await comparePassword(args.password, user.password);
                if (!isPasswordValid) throw new Error("Invalid password");

                const token = generateToken(user);
                return {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    fullName: user.fullName,
                    token: token,
                };
            }),
            "Login successful"
        ),
    },
}