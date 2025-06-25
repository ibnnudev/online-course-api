const {
    GraphQLString,
    GraphQLFloat,
    GraphQLInt,
    GraphQLBoolean
} = require("graphql");
const CourseLevelEnum = require('../../../enums/course-level');

const CourseFields = {
    title: {type: GraphQLString},
    description: {type: GraphQLString},
    price: {type: GraphQLFloat},
    duration: {type: GraphQLInt},
    level: {type: CourseLevelEnum},
    imageUrl: {type: GraphQLString},
    published: {type: GraphQLBoolean},
};

module.exports = CourseFields;
