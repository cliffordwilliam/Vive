"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Events", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false, // required
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false, // required
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false, // required
      },
      time: {
        type: Sequelize.TIME,
        allowNull: false, // required
      },
      location: {
        type: Sequelize.STRING,
        allowNull: false, // required
      },
      category: {
        type: Sequelize.STRING,
        allowNull: false, // required
      },
      organizer_id: {
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
    await queryInterface.dropTable("Events");
  },
};
