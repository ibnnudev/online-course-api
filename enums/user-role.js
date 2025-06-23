const { GraphQLEnumType } = require("graphql");

const UserRoleEnum = new GraphQLEnumType({
  name: "UserRole",
  values: {
    USER: { value: "user" },
    ADMIN: { value: "admin" },
  },
});

module.exports = UserRoleEnum;
