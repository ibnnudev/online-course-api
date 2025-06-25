"use strict";

module.exports = (sequelize, DataTypes) => {
    const Payment = sequelize.define(
        "Payment",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true,
            },
            enrollmentId: {
                type: DataTypes.UUID,
                allowNull: false,
                unique: true,
                references: {
                    model: "Enrollments",
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
                defaultValue: "IDR",
            },
            paymentMethod: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            transactionId: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false,
            },
            status: {
                type: DataTypes.ENUM("pending", "success", "failed", "refunded"),
                defaultValue: "pending",
                allowNull: false,
            },
            paymentDate: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            virtualAccountNo: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            howToPayUrl: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            customerName: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            customerEmail: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            customerPhone: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            expiredDate: {
                type: DataTypes.DATE,
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
            tableName: "payments",
            paranoid: true,
            timestamps: true,
            charset: "utf8",
            collate: "utf8_general_ci",
        }
    );

    Payment.associate = (models) => {
        Payment.belongsTo(models.Enrollment, {
            foreignKey: "enrollmentId",
            as: "enrollment",
            onDelete: "CASCADE",
        });
    };

    return Payment;
};
