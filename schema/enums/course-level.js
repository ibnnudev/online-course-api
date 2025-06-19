const { GraphQLEnumType } = require("graphql");

const CourseLevelEnum = new GraphQLEnumType({
  name: "CourseLevel",
  values: {
    BEGINNER: { value: "beginner" },
    INTERMEDIATE: { value: "intermediate" },
    ADVANCED: { value: "advanced" },
  },
});

module.exports = CourseLevelEnum;
