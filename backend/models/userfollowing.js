"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserFollowing extends Model {
    static associate(models) {
      this.belongsTo(models.User, {
        foreignKey: "follower_id",
      });
      this.belongsTo(models.User, {
        foreignKey: "following_id",
      });
    }
  }
  UserFollowing.init(
    {
      follower_id: DataTypes.INTEGER,
      following_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "UserFollowing",
    }
  );
  return UserFollowing;
};
