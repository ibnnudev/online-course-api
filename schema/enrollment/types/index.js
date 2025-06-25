const {GraphQLObjectType, GraphQLString, GraphQLID} = require("graphql/type");
const {EnrollmentStatusEnum} = require("../../../enums/enrollment-status");
const CourseType = require('../../course/types');

const EnrollmentType = new GraphQLObjectType({
    name: "Enrollment",
    fields: () => ({
        id: {type: GraphQLID},
        userId: {type: GraphQLID},
        courseId: {type: GraphQLID},
        enrollmentDate: {
            type: GraphQLString,
            resolve: (enrollment) => enrollment.enrollmentDate.toISOString()
        },
        course: {
            type: CourseType,
            resolve: (enrollment) => {
                if (!enrollment.course) {
                    return null;
                }

                return {
                    id: enrollment.course.id,
                    title: enrollment.course.title,
                    slug: enrollment.course.slug,
                    description: enrollment.course.description,
                    price: enrollment.course.price,
                    duration: enrollment.course.duration,
                    level: enrollment.course.level
                };
            }
        },
        status: {type: EnrollmentStatusEnum},
        createdAt: {
            type: GraphQLString,
            resolve: (enrollment) => enrollment.createdAt.toISOString()
        },
        updatedAt: {
            type: GraphQLString,
            resolve: (enrollment) => enrollment.updatedAt.toISOString()
        },
        deletedAt: {
            type: GraphQLString,
            resolve: (enrollment) => enrollment.deletedAt ? enrollment.deletedAt.toISOString() : null
        }
    })
})

module.exports = EnrollmentType
