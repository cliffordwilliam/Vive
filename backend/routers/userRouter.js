const express = require("express");

// controller
const UserController = require("../controllers/userController");

// guards
const Middleware = require("../middleware");

// 3rd party api
const Utils = require("../utils");

// create router
const userRouter = express.Router();

// endpoints
// user post is moved into register! at /register
userRouter.get("/", UserController.get);
userRouter.put("/", UserController.put);
userRouter.delete("/", UserController.delete);
userRouter.patch(
  "/",
  Utils.upload.single("profile_picture_url"),
  UserController.patch
); // need upload middleware to have req.file
userRouter.get("/:id", UserController.getId);

// exports
module.exports = userRouter;
