"use strict";

module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define("Course", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    slug: {
      // Added based on your example for SEO-friendly URLs
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    duration: {
      // Changed to STRING to allow for units like "10 hours", "4 weeks"
      type: DataTypes.STRING,
      allowNull: true,
    },
    level: {
      type: DataTypes.ENUM("beginner", "intermediate", "advanced"), // Using ENUM for better validation
      allowNull: false,
    },
    imageUrl: {
      // Added for course thumbnail
      type: DataTypes.STRING,
      allowNull: true,
    },
    published: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    createdBy: {
      // Foreign Key to User
      type: DataTypes.UUID,
      allowNull: true, // Allow null if the creator is deleted, or use CASCADE if you want to delete courses
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });

  Course.associate = (models) => {
    // Course belongs to a User (creator)
    Course.belongsTo(models.User, {
      foreignKey: "createdBy",
      as: "creator",
      onDelete: "SET NULL", // If creator is deleted, set createdBy to NULL
    });

    // Course has many Users (students) through Enrollment (many-to-many)
    Course.belongsToMany(models.User, {
      through: models.Enrollment,
      foreignKey: "courseId",
      as: "students",
      onDelete: "CASCADE", // If course is deleted, delete related enrollments
    });

    // Course can have many Enrollments
    Course.hasMany(models.Enrollment, {
      foreignKey: "courseId",
      as: "enrollments",
      onDelete: "CASCADE",
    });
  };

  return Course;
};
