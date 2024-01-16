const express = require("express");
const db = require("/home/hashim/northcoders/backend/be-nc-news/db/connection.js");
const controllers = require("/home/hashim/northcoders/backend/be-nc-news/db/controllers.js");

const app = express();
//app.use(express.json());

app.get("/api/topics", controllers.getAllTopics);

app.get("/api", controllers.getAllApi);

app.get("/api/articles/:article_id", controllers.getArticlesById);

app.get("/api/articles", controllers.getAllArticles);

app.get("/api/articles/:article_id/comments", controllers.getCommentsByArticleId);

module.exports = app;