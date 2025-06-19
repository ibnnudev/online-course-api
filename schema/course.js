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

const courseMutations = {
  createCoursesAtOnce: {
    type: ResponseHandler,
    args: {
      courses: {
        type: new GraphQLList(
          new GraphQLInputObjectType({
            name: "CourseInput",
            fields: {
              title: { type: GraphQLString },
              description: { type: GraphQLString },
              price: { type: GraphQLFloat },
              duration: { type: GraphQLInt },
              level: { type: CourseLevelEnum },
              imageUrl: { type: GraphQLString },
              published: { type: GraphQLBoolean },
            },
          })
        ),
      },
    },
    resolve: async (_, { courses }) => {
      try {
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
          const slug = courseData.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
          const course = await db.Course.create({
            ...courseData,
            slug,
          });
          createdCourses.push(course);
        }
        return {
          success: true,
          message: "Courses created successfully",
          data: createdCourses,
        };
      } catch (error) {
        throw new Error("Error creating courses: " + error.message);
      }
    },
  },

  createCourse: {
    type: ResponseHandler,
    args: {
      title: { type: GraphQLString },
      description: { type: GraphQLString },
      price: { type: GraphQLFloat },
      duration: { type: GraphQLInt },
      level: { type: CourseLevelEnum },
      imageUrl: { type: GraphQLString },
      published: { type: GraphQLBoolean },
    },
    resolve: async (_, args) => {
      try {
        const existing = await db.Course.findOne({
          where: { title: args.title },
        });
        if (existing)
          throw new Error("Course with this title or slug already exists");
        const slug = args.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
        const course = await db.Course.create({
          ...args,
          slug,
        });
        if (!course) throw new Error("Course creation failed");
        return {
          success: true,
          message: "Course created successfully",
          data: course,
        };
      } catch (error) {
        throw new Error("Error creating course: " + error.message);
      }
    },
  },

  updateCourse: {
    type: ResponseHandler,
    args: {
      id: { type: GraphQLID },
      title: { type: GraphQLString },
      description: { type: GraphQLString },
      price: { type: GraphQLFloat },
      slug: { type: GraphQLString },
      duration: { type: GraphQLInt },
      level: { type: CourseLevelEnum },
      imageUrl: { type: GraphQLString },
      published: { type: GraphQLBoolean },
      createdBy: { type: GraphQLID },
    },
    resolve: async (_, args) => {
      try {
        const course = await db.Course.findByPk(args.id);
        if (!course) throw new Error("Course not found");

        await course.update(args);
        return course;
      } catch (error) {
        throw new Error("Error updating course: " + error.message);
      }
    },
  },

  deleteCourse: {
    type: ResponseHandler,
    args: {
      id: { type: GraphQLID },
    },
    resolve: async (_, { id }) => {
      try {
        const course = await db.Course.findByPk(id);
        if (!course) throw new Error("Course not found");

        await course.destroy();
        return course;
      } catch (error) {
        throw new Error("Error deleting course: " + error.message);
      }
    },
  },
};

const courseQueries = {
  course: {
    type: CourseType,
    args: { id: { type: GraphQLID } },
    resolve: async (_, { id }) => {
      try {
        const course = await db.Course.findByPk(id);
        if (!course) throw new Error("Course not found");
        return course;
      } catch (error) {
        throw new Error("Error fetching course: " + error.message);
      }
    },
  },

  courses: {
    type: new GraphQLList(CourseType),
    resolve: async () => {
      try {
        const courses = await db.Course.findAll();
        return courses;
      } catch (error) {
        throw new Error("Error fetching courses: " + error.message);
      }
    },
  },

  courseBySlug: {
    type: CourseType,
    args: { slug: { type: GraphQLString } },
    resolve: async (_, { slug }) => {
      try {
        const course = await db.Course.findOne({ where: { slug } });
        if (!course) throw new Error("Course not found");
        return course;
      } catch (error) {
        throw new Error("Error fetching course by slug: " + error.message);
      }
    },
  },
};

module.exports = {
  courseMutations,
  courseQueries,
};
