const {GraphQLString} = require("graphql");
const UserRoleEnum = require("../../enums/user-role");

const UserFields = {
    username: {type: GraphQLString},
    email: {type: GraphQLString},
    password: {type: GraphQLString},
    role: {type: UserRoleEnum},
    fullName: {type: GraphQLString},
};

module.exports = UserFields;
