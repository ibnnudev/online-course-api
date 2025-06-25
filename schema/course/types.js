const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLID,
    GraphQLFloat,
    GraphQLInt,
} = require("graphql");
const CourseLevelEnum = require("../../enums/course-level");

const CourseType = new GraphQLObjectType({
    name: "Course",
    fields: () => ({
        id: {type: GraphQLID},
        title: {type: GraphQLString},
        description: {type: GraphQLString},
        price: {type: GraphQLFloat},
        slug: {type: GraphQLString},
        duration: {type: GraphQLInt},
        level: {type: CourseLevelEnum},
        imageUrl: {type: GraphQLString},
        published: {type: GraphQLString},
        createdBy: {type: GraphQLID},
        createdAt: {
            type: GraphQLString,
            resolve: (course) => {
                return course.createdAt ? course.createdAt.toISOString() : null;
            },
        },
        updatedAt: {
            type: GraphQLString,
            resolve: (course) => {
                return course.updatedAt ? course.updatedAt.toISOString() : null;
            },
        },
        deletedAt: {
            type: GraphQLString,
            resolve: (course) => {
                return course.deletedAt ? course.deletedAt.toISOString() : null;
            },
        },
    }),
});

module.exports = CourseType;
