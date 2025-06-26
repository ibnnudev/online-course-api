"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("payments", "partnerServiceId", {
      type: Sequelize.STRING,
      allowNull: true,
      after: "id", // hanya berlaku di MySQL
    });

    await queryInterface.addColumn("payments", "customerNo", {
      type: Sequelize.STRING,
      allowNull: true,
      after: "partnerServiceId",
    });

    await queryInterface.addColumn("payments", "virtualAccountTrxType", {
      type: Sequelize.CHAR(1),
      allowNull: true,
      after: "currency",
    });

    await queryInterface.addColumn("payments", "howToPayApi", {
      type: Sequelize.TEXT,
      allowNull: true,
      after: "howToPayUrl",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("payments", "partnerServiceId");
    await queryInterface.removeColumn("payments", "customerNo");
    await queryInterface.removeColumn("payments", "virtualAccountTrxType");
    await queryInterface.removeColumn("payments", "howToPayApi");
  },
};
