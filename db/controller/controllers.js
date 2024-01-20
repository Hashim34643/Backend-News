const models = require("../model/models");
const fs = require("fs/promises");

function getAllTopics(req, res, next) {
    models.fetchAllTopics().then((response) => {
        res.status(200).send(response.rows);
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
    const sortQuery = req.query.sort_by || "created_at";
    const orderQuery = req.query.order || "DESC";
    models.fetchAllArticles(topicQuery, sortQuery, orderQuery).then((response) => {
        res.status(200).send(response.rows);
    }).catch((error) => {
        next(error);
    })
}

function getCommentsByArticleId(req, res, next) {
    const articleId = req.params.article_id;
    models.fetchCommentsByArticleId(articleId).then((response) => {
        const comments = response.rows;
        res.status(200).send({comments});
    }).catch((error) => {
        next(error);
    })
}

function postCommentsByArticleId(req, res, next) {
    const articleId = req.params.article_id;
    const {username, body} = req.body;

    models.fetchPostCommentsByArticleId(articleId, username, body).then((response) => {
        const comment = response.rows[0];
        res.status(201).send({comment});
    }).catch((error) => {
        next(error);
    }) 
} 

function patchArticleByArticleId(req, res, next) {
    const articleId = req.params.article_id;
    const {incVotes} = req.body;
    models.fetchPatchArticleByArticleId(articleId, incVotes).then((response) => {
        const comment = response.rows[0];
        res.status(200).send({comment});
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
        res.status(200).send(response.rows);
    }).catch((error) => {
        next(error);
    })
} 

function getUserByUsername(req, res, next) {
    const username = req.params.username;
    models.fetchUserByUsername(username).then((response) => {
        res.status(200).send(response.rows[0]);
    }).catch((error) => {
        next(error);
    })
}

function patchCommentByCommentId(req, res, next) {
    const commentId = req.params.comment_id;
    const {incVotes} = req.body;
    models.fetchPatchCommentByCommentId(commentId, incVotes).then((response) => {
        const comment = response.rows[0];
        res.status(200).send({comment});
    }).catch((error) => {
        next(error);
    })
}

module.exports = {getAllTopics, getAllApi, getArticlesById, getAllArticles, getCommentsByArticleId, postCommentsByArticleId, patchArticleByArticleId, deleteCommentsByCommentId, getAllUsers, getUserByUsername, patchCommentByCommentId};