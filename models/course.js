"use strict";

module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define(
    "Course",
    {
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
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      level: {
        type: DataTypes.ENUM("beginner", "intermediate", "advanced"),
        allowNull: false,
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      published: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      createdBy: {
        type: DataTypes.UUID,
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
    },
    {
      tableName: "courses",
      charset: "utf8",
      collate: "utf8_general_ci",
      paranoid: true,
      timestamps: true,
    }
  );

  Course.associate = (models) => {
    Course.belongsTo(models.User, {
      foreignKey: "createdBy",
      as: "creator",
      onDelete: "SET NULL",
    });

    Course.belongsToMany(models.User, {
      through: models.Enrollment,
      foreignKey: "courseId",
      as: "students",
      onDelete: "CASCADE",
    });

    Course.hasMany(models.Enrollment, {
      foreignKey: "courseId",
      as: "enrollments",
      onDelete: "CASCADE",
    });
  };

  return Course;
};
