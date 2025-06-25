const {GraphQLID, GraphQLInt} = require("graphql");

const db = require("../../../models");
const UserType = require('../types')
const ResponseHandler = require("../../../utils/response-handler");
const paginate = require("../../../helper/paginate");
const {wrapQueryResolver} = require("../../../utils/wrapper");
const UserPaginationType = require("../../../utils/pagination")("User", UserType);

const roles = require("../../../constants/roles");
const middlewares = require("../../../middlewares");
const {paginationArgs} = require("../../../constants/pagination");
const isAdmin = require("../../../middlewares/require-role")(roles.ADMIN);

module.exports = {
    users: {
        type: UserPaginationType,
        args: paginationArgs,
        resolve: wrapQueryResolver(
            middlewares([isAdmin], async (_, args) => {
                    const {limit, page, offset} = paginate({limit: args.limit, page: args.page, total: 1});

                    const {count: total, rows: users} = await db.User.findAndCountAll({
                        limit,
                        offset,
                        attributes: {exclude: ["password"]},
                    });

                    return {
                        total,
                        limit,
                        offset,
                        currentPage: page,
                        totalPages: Math.ceil(total / limit),
                        data: users,
                    };
                },
                "Users fetched successfully")
        ),
    },
}