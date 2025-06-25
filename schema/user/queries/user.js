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
    user: {
        type: ResponseHandler,
        args: {id: {type: GraphQLID}},
        resolve: wrapQueryResolver(
            middlewares([isAdmin], async (_, {id}) => {
                const user = await db.User.findByPk(id, {
                    attributes: {exclude: ["password"]},
                });
                if (!user) throw new Error("User not found");
                return user;
            }),
            "User fetched successfully"
        ),
    },
}