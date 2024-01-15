const db = require("/home/hashim/northcoders/backend/be-nc-news/db/connection.js");

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

module.exports = {fetchAllTopics};