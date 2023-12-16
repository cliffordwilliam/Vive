"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("UserFollowings", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      follower_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "id",
        }, // fk
        onUpdate: "cascade", // fk
        onDelete: "cascade", // fk
      },
      following_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "id",
        }, // fk
        onUpdate: "cascade", // fk
        onDelete: "cascade", // fk
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("UserFollowings");
  },
};
