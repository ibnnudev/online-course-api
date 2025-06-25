const CourseFields = require("./fields");
const {GraphQLList, GraphQLInputObjectType, GraphQLInt, GraphQLID, GraphQLString} = require("graphql/index");
const {wrapQueryResolver} = require("../../utils/wrapper");
const CourseType = require('./types');
const CoursePaginationType = require("../../utils/pagination")("Course", CourseType);

const roles = require('../../constants/roles');
const middlewares = require('../../middlewares');
const isAdmin = require('../../middlewares/require-role')(roles.ADMIN)

const {generateSlug} = require("../../helper/generate-slug");

const paginate = require("../../helper/paginate");

const db = require('../../models')

const courseQueries = {
    courses: {
        type: CoursePaginationType, args: {
            limit: {type: GraphQLInt}, page: {type: GraphQLInt},
        }, resolve: wrapQueryResolver(middlewares([isAdmin], async (_, args) => {
                const {limit, page, offset} = paginate({
                    limit: args.limit, page: args.page, total: 1,
                });
                const {count: total, rows: courses} = await db.Course.findAndCountAll({
                    limit, offset,
                });

                return {
                    total, limit, offset, currentPage: page, totalPages: Math.ceil(total / limit), data: courses,
                };
            }, "Courses fetched successfully")
        ),
    },

    course: {
        type: CourseType,
        args: {id: {type: GraphQLID}},
        resolve: wrapQueryResolver(middlewares([isAdmin], async (_, {id}) => {
            const course = await db.Course.findByPk(id);
            if (!course) throw new Error("Course not found");
            return course;
        }), "Course fetched successfully"),
    },

    courseBySlug: {
        type: CourseType,
        args: {slug: {type: GraphQLString}},
        resolve: wrapQueryResolver(middlewares([isAdmin], async (_, {slug}) => {
            const course = await db.Course.findOne({where: {slug}});
            if (!course) throw new Error("Course not found");
            return course;
        }), "Course fetched by slug successfully"),
    },
};

module.exports = courseQueries;
