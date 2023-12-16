const Helper = require("./helper.js");
const { User } = require("./models");

class Middleware {
  static handleError(err, req, res, next) {
    console.log(err);
    switch (err.name) {
      case "SequelizeValidationError":
        return res
          .status(400)
          .json({ status: 400, msg: err.errors[0].message });
      case "SequelizeUniqueConstraintError":
        return res
          .status(400)
          .json({ status: 400, msg: err.errors[0].message });
      case "JsonWebTokenError":
        return res.status(401).json({ status: 401, msg: err.message });
      case "CustomError":
        return res
          .status(err.status)
          .json({ status: err.status, msg: err.msg });
      default:
        return res
          .status(500)
          .json({ status: 500, msg: "Internal Server Error." });
    }
  }
  static async tokenGuard(req, res, next) {
    try {
      // no token? throw
      if (!req.headers.authorization) Helper.customError("Unauthorized.", 401);
      // grab token
      const token = req.headers.authorization.split(" ")[1];
      // token -> payload
      const payload = await Helper.tokenToPayload(token);
      // payload owner dont exist? throw
      const user = await User.findOne({
        where: { username: payload.username },
      });
      if (!user) Helper.customError("Unauthorized.", 401);
      // payload -> user data (excluding password)
      const { id, username, email, profile_picture_url, bio, social_links } =
        user;
      // save user data to req.loggedInUser
      req.loggedInUser = {
        id,
        username,
        email,
        profile_picture_url,
        bio,
        social_links,
      };
      next();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = Middleware;
