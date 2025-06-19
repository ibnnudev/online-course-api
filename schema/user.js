const { GraphQLList, GraphQLString, GraphQLID } = require("graphql");
const UserType = require("./types/user");
const db = require("../models");
const bcrypt = require("bcryptjs");
const UserRoleEnum = require("./enums/user-role");
const ResponseHandler = require("./types/response-handler");

const userQueries = {
  users: {
    type: new GraphQLList(UserType),
    resolve: async () => {
      try {
        const users = await db.User.findAll();
        return users;
      } catch (error) {
        throw new Error("Error fetching users: " + error.message);
      }
    },
  },
  user: {
    type: UserType,
    args: { id: { type: GraphQLID } },
    resolve: async (_, { id }) => {
      try {
        const user = await db.User.findByPk(id, {
          attributes: { exclude: ["password"] },
          include: [
            {
              model: db.Course,
              as: "courses",
              attributes: ["id", "title"],
            },
          ],
        });
        if (!user) {
          throw new Error("User not found");
        }
        return user;
      } catch (error) {
        throw new Error("Error fetching user: " + error.message);
      }
    },
  },
};

const userMutations = {
  createUser: {
    type: ResponseHandler,
    args: {
      username: { type: GraphQLString },
      email: { type: GraphQLString },
      password: { type: GraphQLString },
      role: { type: UserRoleEnum },
      firstName: { type: GraphQLString },
      lastName: { type: GraphQLString },
    },
    resolve: async (_, args) => {
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
        return {
          success: true,
          message: "User created successfully",
          data: newUser,
        };
      } catch (error) {
        throw new Error("Error creating user: " + error.message);
      }
    },
  },
  updateUser: {
    type: ResponseHandler,
    args: {
      id: { type: GraphQLID },
      username: { type: GraphQLString },
      email: { type: GraphQLString },
      password: { type: GraphQLString },
      role: { type: UserRoleEnum },
      firstName: { type: GraphQLString },
      lastName: { type: GraphQLString },
    },
    resolve: async (_, args) => {
      try {
        const user = await db.User.findByPk(args.id, {
          attributes: { exclude: ["password"] },
        });
        if (!user) throw new Error("User not found");

        if (args.password) {
          args.password = await bcrypt.hash(args.password, 10);
        }

        await user.update(args);
        return {
          success: true,
          message: "User updated successfully",
          data: user,
        };
      } catch (error) {
        throw new Error("Error updating user: " + error.message);
      }
    },
  },
  destroyUser: {
    type: ResponseHandler,
    args: { id: { type: GraphQLString } },
    resolve: async (_, { id }) => {
      try {
        const user = await db.User.findByPk(id);
        if (!user) throw new Error("User not found");

        await user.destroy();
        return {
          success: true,
          message: "User deleted successfully",
        };
      } catch (error) {
        throw new Error("Error deleting user: " + error.message);
      }
    },
  },
};

module.exports = {
  userQueries,
  userMutations,
};
