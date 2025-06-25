const ResponseHandler = require('../../utils/response-handler');
const CourseFields = require('./fields');
const {wrapMutationResolver} = require('../../utils/wrapper');
const roles = require('../../constants/roles');
const isAdmin = require('../../middlewares/require-role')(roles.ADMIN)
const {GraphQLID, GraphQLList, GraphQLInputObjectType} = require('graphql');
const db = require('../../models');
const middlewares = require('../../middlewares');
const {generateSlug} = require('../../helper/generate-slug');

const courseMutations = {
    createCourse: {
        type: ResponseHandler,
        args: CourseFields,
        resolve: wrapMutationResolver(middlewares([isAdmin], async (_, args) => {
            const existing = await db.Course.findOne({
                where: {title: args.title},
            });
            if (existing)
                throw new Error(`Course with title "${args.title}" already exists`);

            const slug = generateSlug(args.title);
            return await db.Course.create({...args, slug});
        }), "Course created successfully"),
    },

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

    updateCourse: {
        type: ResponseHandler,
        args: {
            id: {type: GraphQLID},
            ...CourseFields,
        },
        resolve: wrapMutationResolver(middlewares([isAdmin], async (_, args) => {
            const course = await db.Course.findByPk(args.id);
            if (!course) throw new Error("Course not found");

            const existing = await db.Course.findOne({
                where: {title: args.title, id: {[db.Sequelize.Op.ne]: args.id}},
            });
            if (existing)
                throw new Error(`Course with title "${args.title}" already exists`);

            const slug = generateSlug(args.title);
            return await course.update({...args, slug});
        }), "Course updated successfully"),
    },

    deleteCourse: {
        type: ResponseHandler,
        args: {id: {type: GraphQLID}},
        resolve: wrapMutationResolver(middlewares([isAdmin], async (_, {id}) => {
            const course = await db.Course.findByPk(id);
            if (!course) throw new Error("Course not found");

            await course.destroy();
            return null;
        }), "Course deleted successfully"),
    },
};

module.exports = courseMutations;