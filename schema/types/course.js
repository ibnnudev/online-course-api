const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLFloat,
} = require("graphql");

const CourseType = new GraphQLObjectType({
  name: "Course",
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    description: { type: GraphQLString },
    price: { type: GraphQLFloat },
    slug: { type: GraphQLString },
    duration: { type: GraphQLString },
    level: { type: GraphQLString },
    imageUrl: { type: GraphQLString },
    published: { type: GraphQLString },
    createdBy: { type: GraphQLID },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    deletedAt: { type: GraphQLString },
  }),
});

module.exports = CourseType;
