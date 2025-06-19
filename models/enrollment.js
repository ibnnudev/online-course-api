"use strict";

module.exports = (sequelize, DataTypes) => {
  const Enrollment = sequelize.define("Enrollment", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Users", // Name of the target table
        key: "id",
      },
    },
    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Courses", // Name of the target table
        key: "id",
      },
    },
    enrollmentDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM("pending", "completed", "cancelled"),
      defaultValue: "pending",
      allowNull: false,
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

  Enrollment.associate = (models) => {
    // Enrollment belongs to a User
    Enrollment.belongsTo(models.User, {
      foreignKey: "userId",
      as: "student",
      onDelete: "CASCADE", // If user is deleted, delete their enrollments
    });

    // Enrollment belongs to a Course
    Enrollment.belongsTo(models.Course, {
      foreignKey: "courseId",
      as: "course",
      onDelete: "CASCADE", // If course is deleted, delete related enrollments
    });

    // One Enrollment has one Payment
    Enrollment.hasOne(models.Payment, {
      foreignKey: "enrollmentId",
      as: "payment",
      onDelete: "CASCADE", // If enrollment is deleted, delete related payment
    });
  };

  return Enrollment;
};
