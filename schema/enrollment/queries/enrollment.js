const db = require("../../../models");
const EnrollmentType = require('../types')
const ResponseHandler = require("../../../utils/response-handler");
const paginate = require("../../../helper/paginate");
const {wrapQueryResolver} = require("../../../utils/wrapper");
const EnrollmentPaginationType = require("../../../utils/pagination")("Enrollment", EnrollmentType);

const roles = require("../../../constants/roles");
const middlewares = require("../../../middlewares");
const {GraphQLString} = require("graphql/type");
const {paginationArgs} = require("../../../constants/pagination");
const isAdmin = require("../../../middlewares/require-role")(roles.ADMIN);

module.exports = {
    enrollment: {
        type: ResponseHandler,
        args: {
            id: {type: GraphQLString}
        },
        resolve: wrapQueryResolver(
            middlewares([isAdmin], async (_, {id}) => {
                const enrollment = await db.Enrollment.findByPk(id, {
                    include: [
                        {
                            model: db.User,
                            as: 'student',
                            attributes: ['id', 'fullName', 'email']
                        },
                        {
                            model: db.Course,
                            as: 'course',
                            attributes: ['id', 'title']
                        }
                    ]
                });

                if (!enrollment) {
                    throw new Error("Enrollment not found");
                }

                console.log(enrollment);


                return enrollment;
            }), "Enrollment retrieved successfully"
        )
    }
}