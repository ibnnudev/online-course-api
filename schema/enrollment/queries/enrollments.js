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

                const {count: total, rows: enrollments} = await db.Enrollment.findAndCountAll(
                    {
                        limit,
                        offset,
                        include: [
                            {
                                model: db.Course,
                                as: 'course',
                                attributes: ['id', 'slug', 'title', 'description', 'price', 'duration', 'level']
                            }
                        ]
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
    }
}