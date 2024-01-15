const db = require("/home/hashim/northcoders/backend/be-nc-news/db/connection.js");
const fs = require("fs/promises");

function fetchAllTopics() {
    const sqlQuery = `
    SELECT * FROM topics;`;
    return db.query(sqlQuery).then((response) => {
        return response;
    }).catch((error) => {
        console.error("error in models fetchAllTopics Func", error);
        return Promise.reject({status: 400, error: "Invalid query"});
    })
}

function fetchAllApi() {
    const endpointsData = fs.readFile("/home/hashim/northcoders/backend/be-nc-news/endpoints.json", "utf-8").then((response) => {
        return JSON.parse(response);
    }).catch((error) => {
        console.error("error fetching endpointsData", error);
    })
    return endpointsData;
}

module.exports = {fetchAllTopics, fetchAllApi};