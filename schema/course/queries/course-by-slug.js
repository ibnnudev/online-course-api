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
    courseBySlug: {
        type: CourseType,
        args: {slug: {type: GraphQLString}},
        resolve: wrapQueryResolver(middlewares([isAdmin], async (_, {slug}) => {
            const course = await db.Course.findOne({where: {slug}});
            if (!course) throw new Error("Course not found");
            return course;
        }), "Course fetched by slug successfully"),
    },
}