"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("UserEvents", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      participant_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "id",
        }, // fk
        onUpdate: "cascade", // fk
        onDelete: "cascade", // fk
      },
      event_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Events",
          key: "id",
        }, // fk
        onUpdate: "cascade", // fk
        onDelete: "cascade", // fk
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: "RSVP'd",
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
    await queryInterface.dropTable("UserEvents");
  },
};
