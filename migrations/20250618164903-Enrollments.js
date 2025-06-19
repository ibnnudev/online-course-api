"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "enrollments",
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          allowNull: false,
          primaryKey: true,
        },
        userId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: "users",
            key: "id",
          },
        },
        courseId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: "courses",
            key: "id",
          },
        },
        enrollmentDate: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        status: {
          type: Sequelize.ENUM("pending", "active", "completed", "cancelled"),
          allowNull: false,
          defaultValue: "pending",
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        deletedAt: {
          type: Sequelize.DATE,
          allowNull: true,
        },
      },
      {
        charset: "utf8",
        collate: "utf8_general_ci",
        paranoid: true,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("enrollments");
  },
};
