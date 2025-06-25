const ResponseHandler = require('../../../utils/response-handler');
const CourseFields = require('../fields');
const {wrapMutationResolver} = require('../../../utils/wrapper');
const roles = require('../../../constants/roles');
const isAdmin = require('../../../middlewares/require-role')(roles.ADMIN)
const {GraphQLID, GraphQLList, GraphQLInputObjectType} = require('graphql');
const db = require('../../../models');
const middlewares = require('../../../middlewares');
const {generateSlug} = require('../../../helper/generate-slug');

module.exports = {
    createCoursesAtOnce: {
        type: ResponseHandler,
        args: {
            courses: {
                type: new GraphQLList(
                    new GraphQLInputObjectType({
                        name: "CourseInput",
                        fields: CourseFields,
                    })
                ),
            },
        },
        resolve: wrapMutationResolver(middlewares([isAdmin], async (_, {courses}) => {
            const createdCourses = [];

            for (const courseData of courses) {
                const existing = await db.Course.findOne({
                    where: {title: courseData.title},
                });
                if (existing)
                    throw new Error(
                        `Course with title "${courseData.title}" already exists`
                    );

                const slug = generateSlug(courseData.title);
                const course = await db.Course.create({...courseData, slug});
                createdCourses.push(course);
            }

            return createdCourses;
        }), "Courses created successfully"),
    },
};