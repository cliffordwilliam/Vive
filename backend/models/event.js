"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    static associate(models) {
      this.hasMany(models.UserEvent, {
        foreignKey: "event_id",
      });
      this.belongsTo(models.UserEvent, {
        foreignKey: "participant_id",
      });
      this.belongsTo(models.User, {
        foreignKey: "organizer_id",
      });
    }
  }
  Event.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false, // required
        validate: {
          notNull: {
            msg: "Title is required.",
          }, // required
          notEmpty: {
            msg: "Title is required",
          }, // required
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false, // required
        validate: {
          notNull: {
            msg: "Description is required",
          }, // required
          notEmpty: {
            msg: "Description is required",
          }, // required
        },
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false, // required
        validate: {
          notNull: {
            msg: "Date is required",
          }, // required
          notEmpty: {
            msg: "Date is required",
          }, // required
        },
      },
      time: {
        type: DataTypes.TIME,
        allowNull: false, // required
        validate: {
          notNull: {
            msg: "Time is required",
          }, // required
          notEmpty: {
            msg: "Time is required",
          }, // required
        },
      },
      location: {
        type: DataTypes.STRING,
        allowNull: false, // required
        validate: {
          notNull: {
            msg: "Location is required",
          }, // required
          notEmpty: {
            msg: "Location is required",
          }, // required
        },
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false, // required
        validate: {
          notNull: {
            msg: "Category is required",
          }, // required
          notEmpty: {
            msg: "Category is required",
          }, // required
        },
      },
      organizer_id: {
        type: DataTypes.INTEGER,
        allowNull: false, // required
        validate: {
          notNull: {
            msg: "Organizer ID is required",
          }, // required
          notEmpty: {
            msg: "Organizer ID is required",
          }, // required
        },
      },
    },
    {
      sequelize,
      modelName: "Event",
    }
  );
  return Event;
};
