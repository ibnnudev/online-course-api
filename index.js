const { ApolloServer } = require("apollo-server");
const typeDefs = require("./graphql/schema");
const resolvers = require("./graphql/resolvers");
const db = require("./models");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ db, req }),
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
