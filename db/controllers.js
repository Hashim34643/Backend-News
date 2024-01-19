const models = require("/home/hashim/northcoders/backend/be-nc-news/db/models.js");
const fs = require("fs/promises");

function getAllTopics(req, res, next) {
    models.fetchAllTopics().then((response) => {
        res.status(200).send({response});
    }).catch((error) => {
        next(error);
    })
}

function updateEndpointsDynamically(data) {
    return fs.writeFile("/home/hashim/northcoders/backend/be-nc-news/endpoints.json", JSON.stringify(data, null, 2), "utf-8");
}

function getAllApi(req, res, next) {
    fs.readFile("/home/hashim/northcoders/backend/be-nc-news/endpoints.json", "utf-8").then((response) => {
        const endpoints = JSON.parse(response);
        return models.fetchAllApi().then((response) => {
            const newEndpoints = {
                ...endpoints,
                ...response,
            }
            return updateEndpointsDynamically(newEndpoints).then((response) => {
                res.status(200).send({newEndpoints});
            })
        })
    }).catch((error) => {
        next(error);
    })
}

function getArticlesById(req, res, next) {
    const articleId = req.params.article_id;
    models.fetchArticlesById(articleId).then((response) => {
        const article = response.rows[0];
        res.status(200).send(({article}));
    }).catch((error) => {
        next(error);
    })
}

function getAllArticles(req, res, next) {
    const topicQuery = req.query.topic;
    models.fetchAllArticles(topicQuery).then((response) => {
        res.status(200).send({response});
    }).catch((error) => {
        next(error);
    })
}

function getCommentsByArticleId(req, res, next) {
    const articleId = req.params.article_id;
    models.fetchCommentsByArticleId(articleId).then((response) => {
        res.status(200).send({response});
    }).catch((error) => {
        next(error);
    })
}

function postCommentsByArticleId(req, res, next) {
    const articleId = req.params.article_id;
    const {author, body} = req.body;

    models.fetchPostCommentsByArticleId(articleId, author, body).then((response) => {
        res.status(201).send({response});
    }).catch((error) => {
        next(error);
    }) 
} 

function patchArticleByArticleId(req, res, next) {
    const articleId = req.params.article_id;
    const {incVotes} = req.body;
    models.fetchPatchArticleByArticleId(articleId, incVotes).then((response) => {
        res.status(200).send({response});
    }).catch((error) => {
        next(error)
    })
}

function deleteCommentsByCommentId(req, res, next) {
    const commentId = req.params.comment_id;
    models.fetchDeleteCommentsByCommentId(commentId).then((response) => {
        res.status(204).send();
    })
    .catch((error) => {
      next(error);
    });
}

function getAllUsers(req, res, next) {
    models.fetchAllUsers().then((response) => {
        res.status(200).send({response});
    }).catch((error) => {
        next(error);
    })
} 

module.exports = {getAllTopics, getAllApi, getArticlesById, getAllArticles, getCommentsByArticleId, postCommentsByArticleId, patchArticleByArticleId, deleteCommentsByCommentId, getAllUsers};