const {
  GraphQLList,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
} = require("graphql");

const UserType = require("../types/user");
const UserRoleEnum = require("../enums/user-role");
const ResponseHandler = require("../types/response-handler");
const UserPaginationType = require("../utils/pagination");
const { wrapMutationResolver, wrapQueryResolver } = require("../utils/wrapper");
const { hashPassword } = require("../utils/bcrypt");
const paginate = require("../helper/paginate");

const db = require("../models");

const UserFields = {
  username: { type: GraphQLString },
  email: { type: GraphQLString },
  password: { type: GraphQLString },
  role: { type: UserRoleEnum },
  fullName: { type: GraphQLString },
};

const userQueries = {
  users: {
    type: UserPaginationType("User", UserType),
    args: {
      limit: { type: GraphQLInt },
      page: { type: GraphQLInt },
    },
    resolve: wrapQueryResolver(async (_, args) => {
      const { limit, page, offset, totalPages } = paginate({
        limit: args.limit,
        page: args.page,
        total: 1,
      });
      const { count: total, rows: users } = await db.User.findAndCountAll({
        limit,
        offset,
        attributes: { exclude: ["password"] },
      });

      return {
        total,
        limit,
        offset,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        data: users,
      };
    }),
  },

  user: {
    type: UserType,
    args: { id: { type: GraphQLID } },
    resolve: wrapQueryResolver(async (_, { id }) => {
      const user = await db.User.findByPk(id, {
        attributes: { exclude: ["password"] },
      });
      if (!user) throw new Error("User not found");
      return user;
    }, "User fetched successfully"),
  },
};

const userMutations = {
  createUser: {
    type: ResponseHandler,
    args: UserFields,
    resolve: wrapMutationResolver(async (_, args) => {
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

      const newUser = await db.User.create({
        ...args,
        password: hashedPassword,
      });

      return newUser;
    }, "User created successfully"),
  },

  updateUser: {
    type: ResponseHandler,
    args: {
      id: { type: GraphQLID },
      ...UserFields,
    },
    resolve: wrapMutationResolver(async (_, args) => {
      const user = await db.User.findByPk(args.id);
      if (!user) throw new Error("User not found");

      if (args.password) {
        args.password = await hashPassword(args.password);
      }

      const updatedUser = await user.update(args);

      return updatedUser;
    }, "User updated successfully"),
  },

  destroyUser: {
    type: ResponseHandler,
    args: { id: { type: GraphQLString } },
    resolve: wrapMutationResolver(async (_, { id }) => {
      const user = await db.User.findByPk(id);
      if (!user) throw new Error("User not found");

      await user.destroy();
      return null;
    }, "User deleted successfully"),
  },
};

module.exports = {
  userQueries,
  userMutations,
};
