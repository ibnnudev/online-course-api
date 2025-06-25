const {GraphQLObjectType, GraphQLString} = require("graphql");
const UserRoleEnum = require("../../enums/user-role")

const UserType = new GraphQLObjectType({
    name: "User",
    fields: () => ({
        id: {type: GraphQLString},
        username: {type: GraphQLString},
        email: {type: GraphQLString},
        password: {type: GraphQLString},
        role: {type: UserRoleEnum},
        fullName: {type: GraphQLString},
        createdAt: {
            type: GraphQLString,
            resolve: (user) => {
                return user.createdAt ? user.createdAt.toISOString() : null;
            },
        },
        updatedAt: {
            type: GraphQLString,
            resolve: (user) => {
                return user.updatedAt ? user.updatedAt.toISOString() : null;
            },
        },
        deletedAt: {
            type: GraphQLString,
            resolve: (user) => {
                return user.deletedAt ? user.deletedAt.toISOString() : null;
            },
        },
    }),
});

module.exports = UserType;
