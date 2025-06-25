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
    }
};