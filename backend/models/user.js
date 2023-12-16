"use strict";
const { Model } = require("sequelize");
const Helper = require("../helper");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      this.hasMany(models.UserFollowing, {
        foreignKey: "following_id",
        foreignKey: "follower_id",
      });
      this.hasMany(models.UserEvent, {
        foreignKey: "user_id",
      });
      this.hasMany(models.Event, {
        foreignKey: "organizer_id",
      });
    }
  }
  User.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false, // required
        unique: { msg: "Username is already in use." }, // unique
        validate: {
          notNull: {
            msg: "Username cannot be null.",
          }, // required
          notEmpty: {
            msg: "Username cannot be empty.",
          }, // required
        },
      },
      email: {
        type: DataTypes.STRING,
        unique: { msg: "Email is already in use." }, // unique
        validate: {
          isEmail: {
            msg: "Invalid email format.",
          }, //isEmail
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false, // required
        validate: {
          notNull: {
            msg: "Password is cannot be null.",
          }, // required
          notEmpty: {
            msg: "Password is cannot be empty.",
          }, // required
        },
      },
      profile_picture_url: DataTypes.STRING,
      bio: DataTypes.TEXT,
      social_links: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  User.beforeCreate(async (user) => {
    const hashPassword = await Helper.hashPassword(user.password);
    user.password = hashPassword;
  });
  return User;
};
