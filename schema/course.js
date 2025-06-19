const {
  GraphQLID,
  GraphQLString,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLList,
  GraphQLInt,
  GraphQLInputObjectType,
} = require("graphql");
const db = require("../models");
const CourseType = require("./types/course");
const ResponseHandler = require("./types/response-handler");
const CourseLevelEnum = require("./enums/course-level");
const { generateSlug } = require("../helper/generate-slug");
const { wrapMutationResolver, wrapQueryResolver } = require("../utils/wrapper");

const CourseFields = {
  title: { type: GraphQLString },
  description: { type: GraphQLString },
  price: { type: GraphQLFloat },
  duration: { type: GraphQLInt },
  level: { type: CourseLevelEnum },
  imageUrl: { type: GraphQLString },
  published: { type: GraphQLBoolean },
};

const courseMutations = {
  createCoursesAtOnce: {
    type: ResponseHandler,
    args: {
      courses: {
        type: new GraphQLList(
          new GraphQLInputObjectType({
            name: "CourseInput",
            fields: CourseFields,
            description: "Input type for creating multiple courses",
          })
        ),
      },
    },
    resolve: wrapMutationResolver(async ({ courses }) => {
      const createdCourses = [];
      for (const courseData of courses) {
        const existing = await db.Course.findOne({
          where: { title: courseData.title },
        });
        if (existing) {
          throw new Error(
            `Course with title "${courseData.title}" already exists`
          );
        }
        const slug = generateSlug(courseData.title);
        const course = await db.Course.create({
          ...courseData,
          slug,
        });
        createdCourses.push(course);
      }
      return createdCourses;
    }, "Courses created successfully"),
  },

  createCourse: {
    type: ResponseHandler,
    args: CourseFields,
    resolve: wrapMutationResolver(async (args) => {
      const existing = await db.Course.findOne({
        where: { title: args.title },
      });
      if (existing) {
        throw new Error(`Course with title "${args.title}" already exists`);
      }
      const slug = generateSlug(args.title);
      const course = await db.Course.create({ ...args, slug });
      return course;
    }, "Course created successfully"),
  },

  updateCourse: {
    type: ResponseHandler,
    args: {
      id: { type: GraphQLID },
      ...CourseFields,
    },
    resolve: wrapMutationResolver(async (args) => {
      const course = await db.Course.findByPk(args.id);
      if (!course) throw new Error("Course not found");

      const existing = await db.Course.findOne({
        where: { title: args.title, id: { [db.Sequelize.Op.ne]: args.id } },
      });
      if (existing) {
        throw new Error(`Course with title "${args.title}" already exists`);
      }

      const slug = generateSlug(args.title);
      await course.update({ ...args, slug });
      return course;
    }, "Course updated successfully"),
  },

  deleteCourse: {
    type: ResponseHandler,
    args: {
      id: { type: GraphQLID },
    },
    resolve: wrapMutationResolver(async ({ id }) => {
      const course = await db.Course.findByPk(id);
      if (!course) throw new Error("Course not found");

      await course.destroy();
      return {
        success: true,
        message: "Course deleted successfully",
        data: null,
      };
    }, "Course deleted successfully"),
  },
};

const courseQueries = {
  course: {
    type: CourseType,
    args: { id: { type: GraphQLID } },
    resolve: wrapQueryResolver(async ({ id }) => {
      const course = await db.Course.findByPk(id);
      if (!course) throw new Error("Course not found");
      return course;
    }, "Course fetched successfully"),
  },

  courses: {
    type: new GraphQLList(CourseType),
    resolve: wrapQueryResolver(async () => {
      const courses = await db.Course.findAll();
      return courses;
    }, "Courses fetched successfully"),
  },

  courseBySlug: {
    type: CourseType,
    args: { slug: { type: GraphQLString } },
    resolve: wrapQueryResolver(async (_, { slug }) => {
      try {
        const course = await db.Course.findOne({ where: { slug } });
        if (!course) throw new Error("Course not found");
        return course;
      } catch (error) {
        throw new Error("Error fetching course by slug: " + error.message);
      }
    }, "Course fetched successfully by slug"),
  },
};

module.exports = {
  courseMutations,
  courseQueries,
};
