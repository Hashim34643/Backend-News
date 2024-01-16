const db = require("/home/hashim/northcoders/backend/be-nc-news/db/connection.js");
const fs = require("fs/promises");

function fetchAllTopics() {
    const sqlQuery = `
    SELECT * FROM topics;`;
    return db.query(sqlQuery).then((response) => {
        return response;
    }).catch((error) => {
        console.error("error in models fetchAllTopics Func", error);
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

function fetchArticlesById(articleId) {
    if (articleId % 1 !== 0 || articleId <= 0) {
        return Promise.reject({status: 400, error: "Invalid query"});
    }
    const id = articleId;
    const sqlQuery = `
    SELECT * FROM articles
    WHERE articles.article_id = $1`;
    return db.query(sqlQuery, [id]).then((response) => {
        return response;
    }).catch((error) => {
        console.error("error in fetchArticlesById", error);
    })
} 

function fetchAllArticles() {
    const sqlQuery = `
    SELECT
    article_id,
    title,
    topic,
    author,
    created_at,
    votes,
    article_img_url
    FROM
    articles
    ORDER BY articles.created_at DESC`;
    return db.query(sqlQuery).then((response) => {
        return response;
    }).catch((error) => {
        console.error("error in fetchAllArticles", error);
    })
}

function fetchCommentsByArticleId(articleId) {
    if (articleId % 1 !== 0) {
        return Promise.reject({status: 400, error: "Invalid query"});
    }
    const id = articleId;
    const sqlQuery = `
    SELECT * FROM comments
    WHERE article_id = $1
    ORDER BY created_at DESC`;
    return db.query(sqlQuery, [id]).then((response) => {
        if (response.rows.length === 0) {
            return Promise.reject({status: 404, error: "Invalid query"});
        }
        return response;
    }).catch((error) => {
        console.error("error in fetchCommentByArticleId", error);
    })
}

module.exports = {fetchAllTopics, fetchAllApi, fetchArticlesById, fetchAllArticles, fetchCommentsByArticleId};