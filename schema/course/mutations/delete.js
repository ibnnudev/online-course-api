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