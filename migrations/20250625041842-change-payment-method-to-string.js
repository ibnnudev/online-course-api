"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn("payments", "paymentMethod", {
            type: Sequelize.STRING,
            allowNull: false,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn("payments", "paymentMethod", {
            type: Sequelize.ENUM("credit_card", "paypal", "bank_transfer", "va_doku"),
            allowNull: false,
        });
    },
};
