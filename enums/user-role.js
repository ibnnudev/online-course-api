const { GraphQLEnumType } = require("graphql");
const roles = require('../constants/roles');

const UserRoleEnum = new GraphQLEnumType({
  name: "UserRole",
  values: roles
});

module.exports = UserRoleEnum;
