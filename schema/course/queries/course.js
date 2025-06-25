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
    course: {
        type: CourseType,
        args: {id: {type: GraphQLID}},
        resolve: wrapQueryResolver(middlewares([isAdmin], async (_, {id}) => {
            const course = await db.Course.findByPk(id);
            if (!course) throw new Error("Course not found");
            return course;
        }), "Course fetched successfully"),
    },
}