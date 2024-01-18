const db = require("/home/hashim/northcoders/backend/be-nc-news/db/connection.js");
const fs = require("fs/promises");

function fetchAllTopics() {
    const sqlQuery = `
    SELECT * FROM topics;`;
    return db.query(sqlQuery).then((response) => {
        if (response) {
            return response
        }
        return Promise.reject({ status: 500, error: "Internal Server Error" });
    })
}

function fetchAllApi() {
    const endpointsData = fs.readFile("/home/hashim/northcoders/backend/be-nc-news/endpoints.json", "utf-8").then((response) => {
        return JSON.parse(response);
    })
    return endpointsData;
}

function fetchArticlesById(articleId) {
    if (articleId % 1 !== 0 || articleId <= 0) {
        return Promise.reject({ status: 400, error: "Invalid query" });
    }
    const id = articleId;
    const sqlQuery = `
    SELECT * FROM articles
    WHERE articles.article_id = $1`;
    return db.query(sqlQuery, [id]).then((response) => {
        if (response.rows.length === 0) {
            return Promise.reject({ status: 404, error: "Not found" });
        }
        return response;
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
        return Promise.reject({ status: 500, error: "Internal Server Error" });
    })
}

function fetchCommentsByArticleId(articleId) {
    if (articleId % 1 !== 0 || articleId <= 0) {
        return Promise.reject({ status: 400, error: "Invalid query" });
    }
    const id = articleId;
    const sqlQuery = `
    SELECT * FROM comments
    WHERE article_id = $1
    ORDER BY created_at DESC`;
    return db.query(sqlQuery, [id]).then((response) => {
        if (response.rows.length === 0) {
            return Promise.reject({ status: 404, error: "Not found" });
        }
        return response;
    })
}

function fetchPostCommentsByArticleId(articleId, author, body) {
    if (articleId % 1 !== 0 || articleId <= 0) {
        return Promise.reject({status: 400, error: "Invalid query"});
    }
    if (!author || !body || typeof author !== "string" || typeof body !== "string") {
        return Promise.reject({status: 400, error: "Invalid request body"})
    }

    const sqlQuery = `
    INSERT INTO comments (
        article_id,
        author,
        body,
        created_at
    )
    VALUES
    ($1, $2, $3, CURRENT_TIMESTAMP)
    RETURNING
    *;`;
    return db.query(sqlQuery, [articleId, author, body]).then((response) => {
        if (response.rows.length === 0) {
            return Promise.reject({status: 404, error: "Invalid query"});
        }
        return response;
    })
}

module.exports = { fetchAllTopics, fetchAllApi, fetchArticlesById, fetchAllArticles, fetchCommentsByArticleId, fetchPostCommentsByArticleId};