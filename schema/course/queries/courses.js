const CourseFields = require("../fields");
const {GraphQLList, GraphQLInputObjectType, GraphQLInt, GraphQLID, GraphQLString} = require("graphql/index");
const {wrapQueryResolver} = require("../../../utils/wrapper");
const CourseType = require('../types');
const CoursePaginationType = require("../../../utils/pagination")("Course", CourseType);

const roles = require('../../../constants/roles');
const middlewares = require('../../../middlewares');
const isAdmin = require('../../../middlewares/require-role')(roles.ADMIN)

const {generateSlug} = require("../../../helper/generate-slug");

const paginate = require("../../../helper/paginate");

const db = require('../../../models')

module.exports = {
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
}