# Cheats

## Setup

Start npm and get modules.

```
npm init -y
npm i express bcrypt jsonwebtoken dotenv imagekit multer pg sequelize cors
npm i -D nodemon jest sequelize-cli
```

Create .gitignore.

```
node_modules
.env
```

Create .env.

```
SECRET_KEY=

IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=
```

Start sequelize.

```
npx sequelize init
```

Edit sequelize config.json.

```json
{
  "development": {
    "username": "postgres",
    "password": "postgres",
    "database": "name",
    "host": "127.0.0.1",
    "dialect": "postgres"
  },
  "test": {
    "username": "postgres",
    "password": "postgres",
    "database": "nameTest",
    "host": "127.0.0.1",
    "dialect": "postgres"
  },
  "production": {
    "use_env_variable": "DATABASE_URL"
  }
}
```

Create databse & test database.

```
npx sequelize db:create
npx sequelize db:create --env test
```

Create Helper class.

```js
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
}

module.exports = Helper;
```

Create Utils class.

```js
const multer = require("multer");
const ImageKit = require("imagekit");

const storage = multer.memoryStorage();

class Util {
  static imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  });
  static upload = multer({
    storage,
  });
}

module.exports = Util;
```

## Setup table

Steps on setting up tables.

1. Crate models (The ones without FK first)

```
npx sequelize model:create --name Singular --attributes col:datatype,col2:datatype,..
```

2. Edit the migration:
   - constraints (string?)
   - validation (required?)
   - fk

Copy the ones you need.

```js
      col: {
        type: Sequelize.STRING,
        references:{model:"Plural",key:"id"}, // fk
        onUpdate:"cascade", // fk
        onDelete:"cascade", // fk
        allowNull: false, // required
        unique: true, // unique
        defaultValue: 'value', // default value
        validate: {
          isEmail:true, // isEmail
          validate: {len:[5,Infinity]}, // char len min 5
          isUrl:true, // isUrl
          min:100 // min number 100
        }
      },
```

2. Edit the model:
   - constraints (string?)
   - validation (required?)
   - association
   - before create

Copy all and remove the ones you don't need.

```js
    col: {
      type:DataTypes.STRING,
      allowNull:false, // required
      unique: { msg: "Col is already in use." }, // unique
      defaultValue:"value", // default value
      validate:{
        isUrl:{message:"Invalid URL format."}, // isUrl
        len:{args:[5,Infinity],message:"Col must have a minimum of 5 characters."}, // char len min 5
        min:{args:[100],message:'Col must have a minimum value of 100.'}, // min number 100
        isEmail:{message:"Invalid email format."}, //isEmail
        notNull:{message:"Col is required."}, // required
        notEmpty:{message:"Col is required."} // required
      }
    },

    // Association
    static associate(models) {
      this.hasMany(models.UserFollowing, {
        foreignKey: "following_id",
        foreignKey: "follower_id",
      });
      this.belongsTo(models.User, {
        foreignKey: "participant_id",
      });
    }

    // before create hash
    User.beforeCreate(async (user) => {
        const hashPassword = await Helper.hashPassword(user.password);
        user.password = hashPassword;
    });
```

## Migrate

Migrate table and env table.

```
npx sequelize db:migrate
npx sequelize db:migrate --env test
```

## Seed

Create seed.

```
npx sequelize seed:create --name seedName
```

Edit the UP and DOWN.

```js
  // UP
  async up (queryInterface, Sequelize) {
    // hash here because UP is not caught by before create
    await queryInterface.bulkInsert('Plural', [
      {
        username: 'username',
        email: 'email@email.com',
        password: await Helper.passwordHasher("password"),
        role: 'role',
        phoneNumber: '+1 123-456-7890',
        address: '1 Love Lane, Anime City',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: 'username2',
        email: 'email2@email.com',
        password: await Helper.passwordHasher("password2"),
        role: 'role',
        phoneNumber: '+1 123-456-7890',
        address: '1 Love Lane, Anime City',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ],{})
  },

  // DOWN
  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Plural', null, {});
  }
```

Seed the database. Test will seed and unseed itself later.

```
npx sequelize db:seed:all
```

## Middleware

```js
const Helper = require("./helper.js");
const { User } = require("./models");

class Middleware {
  static handleError(err, req, res) {
    console.log(err);
    switch (err.name) {
      case "SequelizeValidationError":
        return res.status(400).json({ msg: err.errors[0].message });
      case "SequelizeUniqueConstraintError":
        return res.status(400).json({ msg: err.errors[0].message });
      case "JsonWebTokenError":
        return res.status(401).json({ msg: err.message });
      case "CustomError":
        return res.status(err.status).json({ msg: err.msg });
      default:
        return res.status(500).json({ msg: "Internal Server Error." });
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
      const { id, username, email, profile_picture, bio, credit } = user;
      // save user data to req.loggedInUser
      req.loggedInUser = { id, username, email, profile_picture, bio, credit };
      next();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = Middleware;
```

## MVC

Order of work:

1. Controllers
2. Routers - (Branches - Home)
3. App
4. www

Controller example.

- POST
- PUT
- GET
- PATCH
- DELETE

```js
const { User } = require("../models");
const Helper = require("../helper");
const Utils = require("../utils");
const { Op } = require("sequelize");
const { OAuth2Client } = require("google-auth-library");

module.exports = class UserController {
  static async post(req, res, next) {
    try {
      // get body
      const { username: bodyUsername, password, email: bodyEmail } = req.body;
      // empty args? auto throw
      const addedUser = await User.create({
        username: bodyUsername,
        password,
        email: bodyEmail,
      });
      // exclude password before sending
      const userWihoutPassword = Helper.sanitizeUser(addedUser);
      // res status
      res.status(201).json({
        status: 201,
        msg: `User successfully registered.`,
        user: userWihoutPassword,
      });
    } catch (error) {
      next(error);
    }
  }
  static async login(req, res, next) {
    try {
      // unpack body
      const { email: bodyEmail, password } = req.body;
      // empty body? throw
      if (!bodyEmail) Helper.customError("Email is required.", 400);
      if (!password) Helper.customError("Password is required.", 400);
      // received email has no associated user? throw
      const foundUser = await Helper.findOne(
        User,
        { email: bodyEmail },
        "User not found. Please check your email or register.",
        401
      );
      if (!(await Helper.comparePassword(password, foundUser.password)))
        Helper.customError("Wrong password. Please try again.", 401);
      // exclude password before sending
      const userWihoutPassword = Helper.sanitizeUser(foundUser);
      // unpack userWihoutPassword
      const { id, username, email, profile_picture, bio, credit } =
        userWihoutPassword;
      // create payload
      const payload = { id, username, email, profile_picture, bio, credit };
      // payload -> token
      const token = await Helper.payloadToToken(payload);
      // res status
      res.status(200).json({
        status: 200,
        msg: `User successfully logged in.`,
        token,
        user: userWihoutPassword,
      });
    } catch (error) {
      next(error);
    }
  }
  static async googleLogin(req, res, next) {
    try {
      const { token } = req.headers;
      const client = new OAuth2Client();
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const [user, created] = await User.findOrCreate({
        where: {
          username: payload.name,
        },
        defaults: {
          username: payload.name,
          email: payload.email,
          password: "password_google",
        },
        hooks: false,
      });
      const access_token = Helper.payloadToToken({
        id: user.id,
        username: user.username,
      });
      const foundUser = await Helper.findOne(
        User,
        { email: payload.email },
        "User not found. Please check your email or register.",
        401
      );
      const userWihoutPassword = Helper.sanitizeUser(foundUser);
      res.status(200).json({
        status: 200,
        msg: `User successfully logged in.`,
        token: access_token,
        user: userWihoutPassword,
      });
    } catch (error) {
      next(error);
    }
  }
  static async get(req, res, next) {
    try {
      // grab req query
      let { username, limit, page, sort, sortField } = req.query; // user/?username=
      // limit & page -> offset
      limit = Math.max(parseInt(limit, 10), 1) || 10; // default 10 if null or not a number (min 1)
      page = Math.max(parseInt(page, 10), 1) || 1; // default 1 if null or not a number (min 1)
      const offset = (page - 1) * limit;
      // sort -> order
      const order = [[sortField || "id", sort || "asc"]]; // sortField and sort default values
      const allowedSortFields = ["username", "email", "credit", "id"]; //check sortField is valid
      if (!allowedSortFields.includes(order[0][0]))
        Helper.customError(
          "Invalid sortField. Please use 'username', 'email', 'credit', or 'id'.",
          400
        );
      const allowedSort = ["asc", "desc"]; // check sort is valid
      if (!allowedSort.includes(order[0][1]))
        Helper.customError("Invalid sort. Please use 'asc' or 'desc'.", 400);
      // search by name -> query
      let query = {};
      if (username) query.username = { [Op.iLike]: `%${username}%` };
      // findAll - using (limit,offset,order,query)
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
      // grab req params
      const { id: paramsId } = req.params; // user/id
      // age not int? throw (24.5? throw) - sequelize auto validation is weird
      Helper.checkInt(paramsId, "User ID");
      // findById
      const foundUser = await Helper.findById(
        paramsId,
        User,
        `User not found. No user with the ID ${paramsId} exists.`,
        404
      );
      // exclude password before sending
      const userWihoutPassword = Helper.sanitizeUser(foundUser);
      // res status
      res.status(200).json({
        status: 200,
        msg: `User successfully retrieved.`,
        user: userWihoutPassword,
      });
    } catch (error) {
      next(error);
    }
  }
  static async put(req, res, next) {
    try {
      // get id from the loggedInUser
      const { id } = req.loggedInUser;
      // unpack the body
      const { username, password, profile_picture, bio, credit } = req.body;
      if (!password) Helper.customError("Password cannot be empty.", 400);
      if (password.length < 3 || password.length > 255)
        Helper.customError(
          "Password must be between 3 and 255 characters.",
          400
        );
      // hash first before storing to db
      const hashedPassword = await Helper.hashPassword(password);
      // use body to update the user data
      const [rowsUpdated, [updatedUser]] = await User.update(
        { username, password: hashedPassword, profile_picture, bio, credit },
        { where: { id }, returning: true }
      );
      // res status
      res.status(200).json({
        status: 200,
        msg: `User successfully updated.`,
        user: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }
  static async patch(req, res, next) {
    try {
      // get id from the loggedInUser
      const { id } = req.loggedInUser;
      // no file in body? throw (need middleware to have req.file)
      console.log(req.file);
      if (!req.file)
        Helper.customError("Profile picture image file is required.", 400);
      // req.file -> base64
      const imgBase64 = req.file.buffer.toString("base64");
      // upload and get the url
      const result = await Utils.imagekit.upload({
        file: imgBase64,
        fileName: req.file.originalname,
        tags: [`${req.file.originalname}`],
      });
      // get the url
      const url = result.url;
      // patch
      const [count, [patchedUser]] = await User.update(
        { profile_picture: url },
        { where: { id }, returning: true }
      );
      // res status
      res.status(200).json({
        status: 200,
        msg: "User profile picture successfully updated.",
        user: patchedUser,
      });
    } catch (error) {
      next(error);
    }
  }
  static async delete(req, res, next) {
    try {
      // get id from the loggedInUser (the other stuff is to be sent back)
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
        msg: `User successfully deleted.`,
        user: deletedUser,
      });
    } catch (error) {
      next(error);
    }
  }
};
```

Branch router example.

```js
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
  Utils.upload.single("profile_picture"),
  UserController.patch
); // need upload middleware to have req.file
userRouter.get("/:id", UserController.getId);

// exports
module.exports = userRouter;
```

Home router example.

```js
const express = require("express");

//child router
const userRouter = require("./userRouter");

// guards
const Middleware = require("../middleware");

// get controllers
const UserController = require("../controllers/userController");

// craete router
const homeRouter = express.Router();
const drinkRouter = require("./drinkRouter");
const gameRouter = require("./gameRouter");
const chatRoomRouter = require("./chatRoomRouter");
const profileRouter = require("./profileRouter");
const chatRouter = require("./chatRouter");
const postRouter = require("./postRouter");
const commentRouter = require("./commentRouter");
const userGameRouter = require("./userGameRouter");
const giftRouter = require("./giftRouter");
const userDrinkRouter = require("./userDrinkRouter");

// free
homeRouter.post("/user/login", UserController.login);
homeRouter.post("/user/register", UserController.post);
homeRouter.post("/user/googleLogin", UserController.googleLogin);

// token guard
homeRouter.use(Middleware.tokenGuard);
homeRouter.use("/user", userRouter);
homeRouter.use("/drink", drinkRouter);
homeRouter.use("/game", gameRouter);
homeRouter.use("/chatRoom", chatRoomRouter);
homeRouter.use("/profile", profileRouter);
homeRouter.use("/chat", chatRouter);
homeRouter.use("/post", postRouter);
homeRouter.use("/comment", commentRouter);
homeRouter.use("/userGame", userGameRouter);
homeRouter.use("/gift", giftRouter);
homeRouter.use("/userDrink", userDrinkRouter);

// exports
module.exports = homeRouter;
```

App example.

```js
const express = require("express");

// production? do not use .env
if (process.env.NODE_ENV !== "production") require("dotenv").config();

// home router
const homeRouter = require("./routers/homeRouter");

// need the handleError
const Middleware = require("./middleware");

// to let anyone bypass
const cors = require("cors");

// create app
const app = express();
app.use(cors());

// socket.io
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// handle signals from frontend
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join_room", (room) => {
    socket.join(room);
  });

  socket.on("send_message", (data) => {
    console.log(data);
    const chats = data.chats;
    socket.to(data.room).emit("receive_message", chats);
  });
});

app.use(express.urlencoded({ extended: true })); // req.body
app.use(express.json()); // for reading jest req
app.use(homeRouter); // enter home router
app.use(Middleware.handleError); // dump all err here

// exports
module.exports = { app, server };
```

www example.

```js
const { app, server } = require("../app");

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  `listening to ${PORT}`;
});
```

## Hosting in GCP

Later create your own environment config file to act as the dotenv.

## Restarting database shortcut

```
npx sequelize db:migrate:undo:all ^
& npx sequelize db:migrate ^
& npx sequelize db:seed:all ^
nodemon .\bin\www.js
```
