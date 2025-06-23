const {ApolloServer} = require("apollo-server");
const schema = require("./schema");
const db = require("./models");
const getUserFromToken = require('./utils/auth');

const formatError = (error) => {
    return {
        success: false,
        message: error.message,
        code: error.extensions?.code || "INTERNAL_SERVER_ERROR",
        path: error.path || null,
        locations: error.locations || null,
    };
};

async function startServer() {
    try {
        await db.sequelize.authenticate();
        await db.sequelize.sync({force: false});

        const server = new ApolloServer({
            schema,
            introspection: true,
            playground: true,
            formatError,
            context: ({req}) => {
                const authHeader = req.headers['x-tokenkuu'] || req.headers['authorization'];
                const user = getUserFromToken(authHeader);
                return {user};
            }
        });

        server.listen().then(({url}) => {
            console.log(`🚀 Server ready at ${url}/graphql`);
        });
    } catch (error) {
        console.error("❌ Unable to connect to the database:", error.message);
    }
}

startServer().then(_ => {
    console.log("Server started successfully");
});
