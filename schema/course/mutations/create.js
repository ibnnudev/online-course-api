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
};