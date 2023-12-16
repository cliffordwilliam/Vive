const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");

class Helper {
  static customError(msg, status) {
    throw { name: "CustomError", msg, status };
  }
  static async hashPassword(value) {
    try {
      return await bcrypt.hash(value, 10);
    } catch (error) {
      throw error;
    }
  }
  static async comparePassword(receivedTypedPassword, databaseHashedPassword) {
    try {
      return await bcrypt.compare(
        receivedTypedPassword,
        databaseHashedPassword
      );
    } catch (error) {
      throw error;
    }
  }
  static payloadToToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET);
  }
  static tokenToPayload(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }
  static checkInt(input, name) {
    const value = parseInt(input, 10);
    if (isNaN(value) || value !== parseFloat(input))
      Helper.customError(`${name} must be an integer.`, 400);
  }
  static checkStr(input, name) {
    const value = parseInt(input, 10);
    if (!isNaN(value)) Helper.customError(`${name} must be a string.`, 400);
  }
  static sanitizeUser(user) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      profile_picture_url: user.profile_picture_url,
      bio: user.bio,
      social_links: user.social_links,
    };
  }
}

module.exports = Helper;
