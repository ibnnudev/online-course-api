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
const CourseType = require("../types/course");
const ResponseHandler = require("../types/response-handler");
const CourseLevelEnum = require("../enums/course-level");

const { generateSlug } = require("../helper/generate-slug");
const { wrapMutationResolver, wrapQueryResolver } = require("../utils/wrapper");
const CoursePaginationType = require("../utils/pagination")(
  "Course",
  CourseType
);
const paginate = require("../helper/paginate");

const CourseFields = {
  title: { type: GraphQLString },
  description: { type: GraphQLString },
  price: { type: GraphQLFloat },
  duration: { type: GraphQLInt },
  level: { type: CourseLevelEnum },
  imageUrl: { type: GraphQLString },
  published: { type: GraphQLBoolean },
};

const courseQueries = {
  courses: {
    type: CoursePaginationType,
    args: {
      limit: { type: GraphQLInt },
      page: { type: GraphQLInt },
    },
    resolve: wrapQueryResolver(async (_, args) => {
      const { limit, page, offset } = paginate({
        limit: args.limit,
        page: args.page,
        total: 1,
      });
      const { count: total, rows: courses } = await db.Course.findAndCountAll({
        limit,
        offset,
      });

      return {
        total,
        limit,
        offset,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        data: courses,
      };
    }),
  },

  course: {
    type: CourseType,
    args: { id: { type: GraphQLID } },
    resolve: wrapQueryResolver(async (_, { id }) => {
      const course = await db.Course.findByPk(id);
      if (!course) throw new Error("Course not found");
      return course;
    }, "Course fetched successfully"),
  },

  courseBySlug: {
    type: CourseType,
    args: { slug: { type: GraphQLString } },
    resolve: wrapQueryResolver(async (_, { slug }) => {
      const course = await db.Course.findOne({ where: { slug } });
      if (!course) throw new Error("Course not found");
      return course;
    }, "Course fetched by slug successfully"),
  },
};

const courseMutations = {
  createCourse: {
    type: ResponseHandler,
    args: CourseFields,
    resolve: wrapMutationResolver(async (_, args) => {
      const existing = await db.Course.findOne({
        where: { title: args.title },
      });
      if (existing)
        throw new Error(`Course with title "${args.title}" already exists`);

      const slug = generateSlug(args.title);
      const newCourse = await db.Course.create({ ...args, slug });

      return newCourse;
    }, "Course created successfully"),
  },

  createCoursesAtOnce: {
    type: ResponseHandler,
    args: {
      courses: {
        type: new GraphQLList(
          new GraphQLInputObjectType({
            name: "CourseInput",
            fields: CourseFields,
          })
        ),
      },
    },
    resolve: wrapMutationResolver(async (_, { courses }) => {
      const createdCourses = [];

      for (const courseData of courses) {
        const existing = await db.Course.findOne({
          where: { title: courseData.title },
        });
        if (existing)
          throw new Error(
            `Course with title "${courseData.title}" already exists`
          );

        const slug = generateSlug(courseData.title);
        const course = await db.Course.create({ ...courseData, slug });
        createdCourses.push(course);
      }

      return createdCourses;
    }, "Courses created successfully"),
  },

  updateCourse: {
    type: ResponseHandler,
    args: {
      id: { type: GraphQLID },
      ...CourseFields,
    },
    resolve: wrapMutationResolver(async (_, args) => {
      const course = await db.Course.findByPk(args.id);
      if (!course) throw new Error("Course not found");

      const existing = await db.Course.findOne({
        where: { title: args.title, id: { [db.Sequelize.Op.ne]: args.id } },
      });
      if (existing)
        throw new Error(`Course with title "${args.title}" already exists`);

      const slug = generateSlug(args.title);
      const updatedCourse = await course.update({ ...args, slug });

      return updatedCourse;
    }, "Course updated successfully"),
  },

  deleteCourse: {
    type: ResponseHandler,
    args: { id: { type: GraphQLID } },
    resolve: wrapMutationResolver(async (_, { id }) => {
      const course = await db.Course.findByPk(id);
      if (!course) throw new Error("Course not found");

      await course.destroy();
      return null;
    }, "Course deleted successfully"),
  },
};

module.exports = {
  courseQueries,
  courseMutations,
};
