const express = require("express");
const db = require("/home/hashim/northcoders/backend/be-nc-news/db/connection.js");
const controllers = require("/home/hashim/northcoders/backend/be-nc-news/db/controllers.js");

const app = express();
//app.use(express.json());

app.get("/api/topics", controllers.getAllTopics);

app.get("/api", controllers.getAllApi);
//app.listen(8005);

module.exports = app;