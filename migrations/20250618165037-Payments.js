"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "payments",
      {
        // id, enrollmentId, amount, currency, paymentMethod, transactionId (from payment gateway), status: `pending (default) | completed | failed`, paymentDate, createdAt, updatedAt, deletedAt
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          allowNull: false,
          primaryKey: true,
        },
        enrollmentId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: "enrollments",
            key: "id",
          },
        },
        amount: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
        },
        currency: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: "IDR",
        },
        paymentMethod: {
          type: Sequelize.ENUM("credit_card", "paypal", "bank_transfer"),
          allowNull: false,
        },
        transactionId: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        status: {
          type: Sequelize.ENUM("pending", "completed", "failed"),
          allowNull: false,
          defaultValue: "pending",
        },
        paymentDate: {
          type: Sequelize.DATE,
          allowNull: true,
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
    await queryInterface.dropTable("payments");
  },
};
