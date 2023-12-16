"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserEvent extends Model {
    static associate(models) {
      this.belongsTo(models.Event, {
        foreignKey: "event_id",
      });
      this.belongsTo(models.User, {
        foreignKey: "participant_id",
      });
    }
  }
  UserEvent.init(
    {
      participant_id: DataTypes.INTEGER,
      event_id: DataTypes.INTEGER,
      status: {
        type: DataTypes.STRING,
        defaultValue: "RSVP'd", // default value
      },
    },
    {
      sequelize,
      modelName: "UserEvent",
    }
  );
  return UserEvent;
};
