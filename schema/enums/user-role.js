const { GraphQLEnumType } = require("graphql");

const UserRoleEnum = new GraphQLEnumType({
  name: "UserRole",
  values: {
    MEMBER: { value: "member" },
    ADMIN: { value: "admin" },
  },
});

module.exports = UserRoleEnum;
