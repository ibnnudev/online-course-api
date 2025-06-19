const { ApolloServer } = require("apollo-server");
const schema = require("./schema");
const db = require("./models");

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
    await db.sequelize.sync({
      alter: true,
    });

    const server = new ApolloServer({
      schema,
      context: ({ req }) => ({ db, req }),
      introspection: true,
      playground: true,
      formatError,
    });

    server.listen().then(({ url }) => {
      console.log(`🚀 Server ready at ${url}`);
    });
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error.message);
  }
}

startServer();
