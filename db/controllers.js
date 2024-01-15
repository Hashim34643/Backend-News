const models = require("/home/hashim/northcoders/backend/be-nc-news/db/models.js");
const fs = require("fs/promises");

function getAllTopics(req, res) {
    models.fetchAllTopics().then((response) => {
        res.status(200).send({response});
    }).catch((error) => {
        console.error("error in controllers getAllTopics Func", error);
        res.status(400).send(error);
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
        console.error("error reading file getAllApi Func", error);
    })
}

module.exports = {getAllTopics, getAllApi};