"use strict";

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("member", "admin"),
      defaultValue: "member",
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
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

  User.associate = (models) => {
    // User (admin) can create many Courses
    User.hasMany(models.Course, {
      foreignKey: "createdBy",
      as: "createdCourses",
      onDelete: "SET NULL",
    });

    // User (member) can enroll in many Courses (many-to-many through Enrollment)
    User.belongsToMany(models.Course, {
      through: models.Enrollment,
      foreignKey: "userId",
      as: "enrolledCourses",
      onDelete: "CASCADE",
    });

    // User can have many Enrollments
    User.hasMany(models.Enrollment, {
      foreignKey: "userId",
      as: "enrollments",
      onDelete: "CASCADE",
    });
  };

  return User;
};
