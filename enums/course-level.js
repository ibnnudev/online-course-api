const {GraphQLEnumType} = require("graphql");
const courseLevel = require('../constants/course-level')

const CourseLevelEnum = new GraphQLEnumType({
    name: "CourseLevel",
    values: courseLevel,
});

module.exports = CourseLevelEnum;
