"use strict";

module.exports = (sequelize, DataTypes) => {
  const Enrollment = sequelize.define(
    "Enrollment",
    {
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
          model: "Users",
          key: "id",
        },
      },
      courseId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Courses",
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
    },
    {
      tableName: "enrollments",
      paranoid: true,
      timestamps: true,
      charset: "utf8",
      collate: "utf8_general_ci",
    }
  );

  Enrollment.associate = (models) => {
    Enrollment.belongsTo(models.User, {
      foreignKey: "userId",
      as: "student",
      onDelete: "CASCADE",
    });

    Enrollment.belongsTo(models.Course, {
      foreignKey: "courseId",
      as: "course",
      onDelete: "CASCADE",
    });

    Enrollment.hasOne(models.Payment, {
      foreignKey: "enrollmentId",
      as: "payment",
      onDelete: "CASCADE",
    });
  };

  return Enrollment;
};
