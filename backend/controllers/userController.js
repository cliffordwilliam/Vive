const Helper = require("../helper.js");
const { User } = require("../models/index.js");
const { Op } = require("sequelize");
const Utils = require("../utils.js");
const user = require("../models/user.js");

module.exports = class UserController {
  static async post(req, res, next) {
    try {
      // unpack body
      const { username, password } = req.body;
      // POST
      const addedUser = await User.create({ username, password });
      // repack user without password
      const userWithoutPassword = Helper.sanitizeUser(addedUser);
      // send 201
      res.status(201).json({
        status: 201,
        msg: "User successfully registered.",
        user: userWithoutPassword,
      });
    } catch (error) {
      next(error);
    }
  }
  static async login(req, res, next) {
    try {
      // unpack body
      const { username, password } = req.body;
      // body empty? throw
      if (!username || !password) {
        Helper.customError("Username and password are required.", 400);
      }
      // GET
      const foundUser = await User.findOne({ where: { username } });
      // username don't exist? throw
      if (!foundUser) {
        Helper.customError(
          "Username not found. Please double-check your username or register for a new account.",
          404
        );
      }
      // password wrong? throw
      if (!(await Helper.comparePassword(password, foundUser.password))) {
        Helper.customError("Wrong password. Please try again.", 401);
      }
      // foundUser + body -> payload
      const payload = {
        id: foundUser.id,
        username,
        email: foundUser.email,
        profile_picture_url: foundUser.profile_picture_url,
        bio: foundUser.bio,
        social_links: foundUser.social_links,
      };
      // payload -> token
      const token = await Helper.payloadToToken(payload);
      // send 200 (token + payload)
      res.status(200).json({
        status: 200,
        msg: "User successfully logged in.",
        token,
        user: payload,
      });
    } catch (error) {
      next(error);
    }
  }
  static async get(req, res, next) {
    try {
      // unpack query
      let { search, searchField, limit, page, sort, sortField } = req.query; // user/?username=
      // limit & page -> offset
      limit = Math.max(parseInt(limit, 10), 1) || 10; // 10 if null or not a number (min 1)
      page = Math.max(parseInt(page, 10), 1) || 1; // 1 if null or not a number (min 1)
      const offset = (page - 1) * limit;
      // sort -> order
      const order = [[sortField || "username", sort || "asc"]]; // sortField and sort default values
      const allowedSortFields = ["username", "email"]; //check sortField is valid
      if (!allowedSortFields.includes(order[0][0])) {
        Helper.customError(
          "Invalid sortField. Please use 'username' or 'email'.",
          400
        );
      }
      const allowedSort = ["asc", "desc"]; // check sort is valid
      if (!allowedSort.includes(order[0][1])) {
        Helper.customError("Invalid sort. Please use 'asc' or 'desc'.", 400);
      }
      // search & searchField -> query
      search = search || ""; // search default values
      searchField = searchField || "username"; // searchField default values
      const allowedSearchFields = ["username", "email", "bio", "social_links"]; // check searchField is valid
      if (!allowedSearchFields.includes(searchField)) {
        Helper.customError(
          "Invalid searchField. Please use 'username', 'email', 'bio' or 'social_links'.",
          400
        );
      }
      let query = {};
      if (search) {
        query[searchField] = { [Op.iLike]: `%${search}%` };
      }
      // GET - using (limit,offset,order,query)
      const users = await User.findAll({
        attributes: { exclude: ["password"] },
        limit,
        offset,
        order,
        where: query,
      });
      // res status
      res.status(200).json({
        status: 200,
        msg: `Users successfully retrieved.`,
        users,
      });
    } catch (error) {
      next(error);
    }
  }
  static async getId(req, res, next) {
    try {
      // unpack params
      const { id: paramsId } = req.params; // user/id
      // age not int? throw - Cannot custom SQL err
      Helper.checkInt(paramsId, "User ID");
      // GET
      const foundUser = await User.findByPk(paramsId, {
        attributes: { exclude: ["password"] },
      });
      // don't exist? throw
      if (!foundUser) {
        Helper.customError(
          `User not found. No user with the ID ${paramsId} exists.`,
          404
        );
      }
      // res status
      res.status(200).json({
        status: 200,
        msg: `User successfully retrieved.`,
        user: foundUser,
      });
    } catch (error) {
      next(error);
    }
  }
  static async put(req, res, next) {
    try {
      // get id from the loggedInUser
      const { id } = req.loggedInUser;
      // unpack body
      const { username, email, password, bio, social_links } = req.body;
      // can't edit profile_picture_url here
      let profile_picture_url = req.loggedInUser.profile_picture_url;
      // GET
      if (username) {
        // username? alr used? throw
        const foundUsername = await User.findOne({ where: { username } });
        if (foundUsername) {
          Helper.customError(`That username is unavailable.`, 400);
        }
      }
      if (email) {
        // email? alr used? throw
        const foundEmail = await User.findOne({ where: { email } });
        if (foundEmail) {
          Helper.customError(`That email is unavailable.`, 400);
        }
      }
      if (password) {
        // password? hash first before storing to db
        password = await Helper.hashPassword(password);
      }
      // got changes? PUT
      if (
        !username === req.loggedInUser.username &&
        !email === req.loggedInUser.email &&
        !password === req.loggedInUser.password &&
        !bio === req.loggedInUser.bio &&
        !social_links === req.loggedInUser.social_links
      ) {
        // use body to update the user data
        const [rowsUpdated, [updatedUser]] = await User.update(
          {
            // optional update, empty? use the logged in user data
            username: username || req.loggedInUser.username,
            email: email || req.loggedInUser.email,
            password: password || req.loggedInUser.password,
            profile_picture_url: profile_picture_url,
            bio: bio || req.loggedInUser.bio,
            social_links: social_links || req.loggedInUser.social_links,
          },
          {
            where: { id },
            returning: true,
            attributes: { exclude: ["password"] },
          }
        );
        // req.loggedInUser + body -> payload (incase username / email were changed)
        const payload = {
          id,
          username,
          email,
          profile_picture_url,
          bio,
          social_links,
        };
        // payload -> token
        const token = await Helper.payloadToToken(payload);
        // res status
        res.status(200).json({
          status: 200,
          msg: `User successfully updated. Please use this new token.`,
          user: updatedUser,
          token,
        });
      } else {
        // No changes? do nothing
        // res status
        res.status(200).json({
          status: 200,
          msg: `No changes were made.`,
        });
      }
    } catch (error) {
      next(error);
    }
  }
  static async patch(req, res, next) {
    try {
      // get id from the loggedInUser
      const { id } = req.loggedInUser;
      // no file in body? throw (need middleware to have req.file)
      if (!req.file) {
        Helper.customError("Profile picture image file is required.", 400);
      }
      // req.file -> base64
      const imgBase64 = req.file.buffer.toString("base64");
      // upload and get the url
      const result = await Utils.imagekit.upload({
        file: imgBase64,
        fileName: req.file.originalname,
        tags: [`${req.file.originalname}`],
      });
      // imagekit server not working?
      if (!result.url) {
        Helper.customError("Failed to upload the profile picture.", 500);
      }
      // get the url
      const url = result.url;
      // PATCH
      const [count, [patchedUser]] = await User.update(
        { profile_picture_url: url },
        {
          where: { id },
          returning: true,
          attributes: { exclude: ["password"] },
        }
      );
      let userWithoutPassword = Helper.sanitizeUser(patchedUser);
      // res status
      res.status(200).json({
        status: 200,
        msg: "User profile picture successfully updated.",
        user: userWithoutPassword,
      });
    } catch (error) {
      next(error);
    }
  }
  static async delete(req, res, next) {
    try {
      // get id from the loggedInUser (this stuff is to be sent back)
      const { id, username, email, profile_picture, bio, credit } =
        req.loggedInUser;
      // use body to update the user data
      await User.destroy({ where: { id } });
      // clear session / token
      res.clearCookie("jwtToken");
      // pack the deleted user to be sent
      const deletedUser = { id, username, email, profile_picture, bio, credit };
      // res status
      res.status(200).json({
        status: 200,
        msg: `User ${username} successfully deleted.`,
        user: deletedUser,
      });
    } catch (error) {
      next(error);
    }
  }
};
