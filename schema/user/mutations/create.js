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
    createUser: {
        type: ResponseHandler,
        args: UserFields,
        resolve: wrapMutationResolver(
            middlewares([isAdmin], async (_, args) => {
                const existingUser = await db.User.findOne({
                    where: {
                        email: args.email,
                        username: args.username,
                    },
                });
                if (existingUser) {
                    throw new Error("User with this email or username already exists");
                }

                const hashedPassword = await hashPassword(args.password);
                return await db.User.create({
                    ...args,
                    password: hashedPassword,
                });
            }),
            "User created successfully"
        ),
    },
}