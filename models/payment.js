"use strict";

module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define("Payment", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    enrollmentId: {
      // Foreign Key to Enrollment
      type: DataTypes.UUID,
      allowNull: false,
      unique: true, // Ensures one payment per enrollment
      references: {
        model: "Enrollments", // Name of the target table
        key: "id",
      },
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "IDR", // Assuming Indonesia Rupiah as default
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: true, // Could be 'Credit Card', 'Bank Transfer', 'E-wallet' etc.
    },
    transactionId: {
      // ID from payment gateway
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },
    paymentStatus: {
      type: DataTypes.ENUM("pending", "success", "failed", "refunded"),
      defaultValue: "pending",
      allowNull: false,
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
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

  Payment.associate = (models) => {
    // Payment belongs to one Enrollment
    Payment.belongsTo(models.Enrollment, {
      foreignKey: "enrollmentId",
      as: "enrollment",
      onDelete: "CASCADE", // If enrollment is deleted, delete related payment
    });
  };

  return Payment;
};
