const db = require("../../models");
const EnrollmentType = require('./types')
const ResponseHandler = require("../../utils/response-handler");
const paginate = require("../../helper/paginate");
const {wrapQueryResolver} = require("../../utils/wrapper");
const EnrollmentPaginationType = require("../../utils/pagination")("Enrollment", EnrollmentType);

const roles = require("../../constants/roles");
const middlewares = require("../../middlewares");
const {GraphQLInt, GraphQLString} = require("graphql/type");
const {paginationArgs} = require("../../constants/pagination");
const {EnrollmentStatusEnum} = require("../../enums/enrollment-status");
const isAdmin = require("../../middlewares/require-role")(roles.ADMIN);

const enrollmentQueries = {
    enrollments: {
        type: EnrollmentPaginationType,
        args: paginationArgs,
        resolve: wrapQueryResolver(
            middlewares([isAdmin], async (_, args) => {
                const {limit, page, offset} = paginate({
                    limit: args.limit,
                    page: args.page,
                    total: 1,
                })

                const {count: total, rows: enrollments} = await db.Enrollment.findAndCountAll({
                    limit,
                    offset
                })

                return {
                    total,
                    limit,
                    offset,
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    data: enrollments,
                }
            }, "Enrollments retrieved successfully")
        )
    },
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
    },
}

module.exports = enrollmentQueries;