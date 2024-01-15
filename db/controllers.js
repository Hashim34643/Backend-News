const models = require("/home/hashim/northcoders/backend/be-nc-news/db/models.js");

function getAllTopics(req, res) {
    models.fetchAllTopics().then((response) => {
        res.status(200).send({response});
    }).catch((error) => {
        console.error("error in controllers getAllTopics Func", error);
        res.status(400).send(error);
    })
}

module.exports = {getAllTopics};