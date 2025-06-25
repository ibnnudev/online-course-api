require('dotenv').config();
const express = require('express');
const http = require('http');
const {ApolloServer} = require('@apollo/server');
const {expressMiddleware} = require('@apollo/server/express4');
const {ApolloServerPluginDrainHttpServer} = require('@apollo/server/plugin/drainHttpServer');
const cors = require('cors');
const bodyParser = require('body-parser');

const db = require('./models');
const schema = require('./schema');
const getUserFromToken = require('./utils/auth');

const app = express();
const httpServer = http.createServer(app);

const formatError = (error) => ({
    success: false,
    message: error.message,
    code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
    path: error.path || null,
    locations: error.locations || null,
});

async function startServer() {
    try {
        await db.sequelize.authenticate();
        await db.sequelize.sync({force: false});
        console.log("✅ Database connected");

        const server = new ApolloServer({
            schema,
            formatError,
            plugins: [ApolloServerPluginDrainHttpServer({httpServer})],
        });

        await server.start();

        app.use(
            '/graphql',
            cors(),
            bodyParser.json(),
            expressMiddleware(server, {
                context: async ({req}) => {
                    const authHeader = req.headers['x-tokenkuu'] || req.headers['authorization'];
                    const user = getUserFromToken(authHeader);
                    return {user};
                },
            })
        );

        const PORT = process.env.PORT || 4000;
        httpServer.listen(PORT, () => {
            console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
        });

    } catch (err) {
        console.error("❌ Server error:", err.message);
    }
}

startServer();
