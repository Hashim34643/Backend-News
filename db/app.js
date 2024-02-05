const express = require("express");
const cors = require('cors');
const db = require("./connection");
const controllers = require("./controller/controllers");

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    next();
});

app.get("/api/topics", controllers.getAllTopics);

app.get("/api", controllers.getAllApi);

app.get("/api/articles/:article_id", controllers.getArticlesById);

app.get("/api/articles", controllers.getAllArticles);

app.get("/api/articles/:article_id/comments", controllers.getCommentsByArticleId);

app.get("/api/users", controllers.getAllUsers);

app.get("/api/users/:username", controllers.getUserByUsername);

app.post("/api/articles/:article_id/comments", controllers.postCommentsByArticleId);

app.post("/api/articles", controllers.postArticle);

app.patch("/api/articles/:article_id", controllers.patchArticleByArticleId);

app.patch("/api/comments/:comment_id", controllers.patchCommentByCommentId);

app.delete("/api/comments/:comment_id", controllers.deleteCommentsByCommentId)

app.use((err, req, res, next) => {
    if (err.status === 404) {
        res.status(404).json({status: 404, error: "Not Found", message: err.error});
    } else if (err.status === 400) {
        res.status(400).json({status: 400, error: "Bad Request", message: err.error});
    } else {
        res.status(500).json({status: 500, error: "Internal Server Error"});
    }
});

module.exports = app;