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

app.use(express.urlencoded({ extended: true })); // req.body
app.use(express.json()); // for reading jest req
app.use(homeRouter); // enter home router
app.use(Middleware.handleError); // dump all err here

// exports
module.exports = { app };
