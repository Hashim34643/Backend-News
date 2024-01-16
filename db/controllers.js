const models = require("/home/hashim/northcoders/backend/be-nc-news/db/models.js");
const fs = require("fs/promises");

function getAllTopics(req, res) {
    models.fetchAllTopics().then((response) => {
        res.status(200).send({response});
    }).catch((error) => {
        console.error("error in controllers getAllTopics Func", error);
        res.status(400).send({status: 400, error: "Invalid query"});
    })
}

function updateEndpointsDynamically(data) {
    return fs.writeFile("/home/hashim/northcoders/backend/be-nc-news/endpoints.json", JSON.stringify(data, null, 2), "utf-8");
}

function getAllApi(req, res) {
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
        console.error("error in getAllApi", error);
        res.status(400).send({status: 400, error: "Invalid query"});
    })
}

function getArticlesById(req, res) {
    const articleId = req.params.article_id;
    models.fetchArticlesById(articleId).then((response) => {
        const article = response.rows[0];
        res.status(200).send(({article}));
    }).catch((error) => {
        console.error(error);
        res.status(400).send({status: 400, error: "Invalid query"});
    })
}

function getAllArticles(req, res) {
    models.fetchAllArticles().then((response) => {
        res.status(200).send({response});
    }).catch((error) => {
        console.error(error);
        res.status(400).send({status: 400, error: "Invalid query"});
    })
}

module.exports = {getAllTopics, getAllApi, getArticlesById, getAllArticles};