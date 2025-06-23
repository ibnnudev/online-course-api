const {GraphQLString, GraphQLID, GraphQLInt} = require("graphql");

const UserType = require("../types/user");
const UserRoleEnum = require("../enums/user-role");
const UserPaginationType = require("../utils/pagination");
const {wrapMutationResolver, wrapQueryResolver} = require("../utils/wrapper");
const {hashPassword, comparePassword} = require("../utils/bcrypt");
const paginate = require("../helper/paginate");

const db = require("../models");
const generateToken = require('../helper/generate-token');
const ResponseHandler = require('../types/response-handler');

const roles = require('../constants/roles');
const middlewares = require('../middlewares');
const isAdmin = require('../middlewares/require-role')(roles.ADMIN)

const UserFields = {
    username: {type: GraphQLString},
    email: {type: GraphQLString},
    password: {type: GraphQLString},
    role: {type: UserRoleEnum},
    fullName: {type: GraphQLString},
};

const userQueries = {
    users: {
        type: UserPaginationType("User", UserType),
        args: {
            limit: {type: GraphQLInt},
            page: {type: GraphQLInt},
        },
        resolve: wrapQueryResolver(middlewares([isAdmin], async (_, args) => {
            const {limit, page, offset} = paginate({
                limit: args.limit,
                page: args.page,
                total: 1,
            });
            const {count: total, rows: users} = await db.User.findAndCountAll({
                limit,
                offset,
                attributes: {exclude: ["password"]},
            });

            return {
                total,
                limit,
                offset,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                data: users,
            };
        })),
    },

    user: {
        type: ResponseHandler,
        args: {id: {type: GraphQLID}},
        resolve: wrapQueryResolver(middlewares([isAdmin], async (_, {id}) => {
            console.log("Fetching user with ID:", id);
            const user = await db.User.findByPk(id, {
                attributes: {exclude: ["password"]},
            });
            if (!user) throw new Error("User not found");
            return user;
        }), "User fetched successfully"),
    },
};

const userMutations = {
    createUser: {
        type: ResponseHandler,
        args: UserFields,
        resolve: wrapMutationResolver(middlewares([isAdmin], async (_, args) => {
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

        }, "User created successfully"))
    },

    updateUser: {
        type: ResponseHandler,
        args: {
            id: {type: GraphQLID},
            ...UserFields,
        },
        resolve: wrapMutationResolver(middlewares([isAdmin], async (_, args) => {
            const user = await db.User.findByPk(args.id);
            if (!user) throw new Error("User not found");

            if (args.password) {
                args.password = await hashPassword(args.password);
            }

            return await user.update(args);
        }), "User updated successfully"),
    },

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

    login: {
        type: ResponseHandler,
        args: {
            username: {type: GraphQLString},
            password: {type: GraphQLString}
            ,
        },
        resolve: wrapMutationResolver(middlewares([isAdmin], async (_, args) => {
            const user = await db.User.findOne({
                where: {
                    username: args.username,
                }
            });
            if (!user) throw new Error("User not found");
            const isPasswordValid = await comparePassword(args.password, user.password)
            if (!isPasswordValid) throw new Error("Invalid password");

            const token = generateToken(user);
            return {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                fullName: user.fullName,
                token: token,
            }
        }), "Login successful"),
    }
};

module.exports = {
    userQueries,
    userMutations,
};
