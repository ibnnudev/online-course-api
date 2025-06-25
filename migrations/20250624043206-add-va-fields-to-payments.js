"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await Promise.all([
            queryInterface.addColumn("payments", "virtualAccountNo", {
                type: Sequelize.STRING,
                allowNull: true,
            }),
            queryInterface.addColumn("payments", "howToPayUrl", {
                type: Sequelize.TEXT,
                allowNull: true,
            }),
            queryInterface.addColumn("payments", "customerName", {
                type: Sequelize.STRING,
                allowNull: true,
            }),
            queryInterface.addColumn("payments", "customerEmail", {
                type: Sequelize.STRING,
                allowNull: true,
            }),
            queryInterface.addColumn("payments", "customerPhone", {
                type: Sequelize.STRING,
                allowNull: true,
            }),
            queryInterface.addColumn("payments", "expiredDate", {
                type: Sequelize.DATE,
                allowNull: true,
            }),
            // Ubah ENUM paymentMethod untuk tambahkan "va_doku"
            queryInterface.changeColumn("payments", "paymentMethod", {
                type: Sequelize.ENUM("credit_card", "paypal", "bank_transfer", "va_doku"),
                allowNull: false,
            }),
        ]);
    },

    async down(queryInterface, Sequelize) {
        await Promise.all([
            queryInterface.removeColumn("payments", "virtualAccountNo"),
            queryInterface.removeColumn("payments", "howToPayUrl"),
            queryInterface.removeColumn("payments", "customerName"),
            queryInterface.removeColumn("payments", "customerEmail"),
            queryInterface.removeColumn("payments", "customerPhone"),
            queryInterface.removeColumn("payments", "expiredDate"),
            // Revert ENUM ke versi sebelumnya
            queryInterface.changeColumn("payments", "paymentMethod", {
                type: Sequelize.ENUM("credit_card", "paypal", "bank_transfer"),
                allowNull: false,
            }),
        ]);
    },
};
