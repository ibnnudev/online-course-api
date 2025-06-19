const { GraphQLList, GraphQLString, GraphQLID } = require("graphql");
const UserType = require("./types/user");
const db = require("../models");
const bcrypt = require("bcryptjs");
const UserRoleEnum = require("./enums/user-role");
const ResponseHandler = require("./types/response-handler");
const { wrapMutationResolver, wrapQueryResolver } = require("../utils/wrapper");

const UserFields = {
  username: { type: GraphQLString },
  email: { type: GraphQLString },
  password: { type: GraphQLString },
  role: { type: UserRoleEnum },
  firstName: { type: GraphQLString },
  lastName: { type: GraphQLString },
};

const userQueries = {
  users: {
    type: new GraphQLList(UserType),
    resolve: wrapQueryResolver(async () => {
      try {
        const users = await db.User.findAll();
        return users;
      } catch (error) {
        throw new Error("Error fetching users: " + error.message);
      }
    }, "Users fetched successfully"),
  },
  user: {
    type: UserType,
    args: { id: { type: GraphQLID } },
    resolve: wrapQueryResolver(async (_, { id }) => {
      try {
        const user = await db.User.findByPk(id, {
          attributes: { exclude: ["password"] },
        });
        if (!user) throw new Error("User not found");
        return user;
      } catch (error) {
        throw new Error("Error fetching user: " + error.message);
      }
    }, "User fetched successfully"),
  },
};

const userMutations = {
  createUser: {
    type: ResponseHandler,
    args: UserFields,
    resolve: wrapMutationResolver(async (_, args) => {
      try {
        const existingUser = await db.User.findOne({
          where: { email: args.email, username: args.username },
        });
        if (existingUser)
          throw new Error("User with this email or username already exists");
        const hashedPassword = await bcrypt.hash(args.password, 10);
        const newUser = await db.User.create(
          {
            ...args,
            password: hashedPassword,
          },
          {
            attributes: { exclude: ["password"] },
          }
        );
        return newUser;
      } catch (error) {
        throw new Error("Error creating user: " + error.message);
      }
    }, "User created successfully"),
  },
  updateUser: {
    type: ResponseHandler,
    args: {
      id: { type: GraphQLID },
      ...UserFields,
    },
    resolve: wrapMutationResolver(async (_, args) => {
      try {
        const user = await db.User.findByPk(args.id, {
          attributes: { exclude: ["password"] },
        });
        if (!user) throw new Error("User not found");

        if (args.password) {
          args.password = await bcrypt.hash(args.password, 10);
        }

        const updatedUser = await user.update(args);

        return updatedUser;
      } catch (error) {
        throw new Error("Error updating user: " + error.message);
      }
    }, "User updated successfully"),
  },
  destroyUser: {
    type: ResponseHandler,
    args: { id: { type: GraphQLString } },
    resolve: wrapMutationResolver(async (_, { id }) => {
      try {
        const user = await db.User.findByPk(id);
        if (!user) throw new Error("User not found");

        await user.destroy();
        return null;
      } catch (error) {
        throw new Error("Error deleting user: " + error.message);
      }
    }, "User deleted successfully"),
  },
};

module.exports = {
  userQueries,
  userMutations,
};
