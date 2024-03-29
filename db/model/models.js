const db = require("../connection");
const fs = require("fs/promises");

function fetchGetAllTopics() {
    const sqlQuery = `
    SELECT * FROM topics;`;
    return db.query(sqlQuery).then((response) => {
        if (response) {
            return response
        }
        return Promise.reject({ status: 500, error: "Internal Server Error" });
    })
}

function fetchGetAllApi() {
    const endpointsData = fs.readFile("/home/hashim/northcoders/backend/be-nc-news/endpoints.json", "utf-8").then((response) => {
        return JSON.parse(response);
    })
    return endpointsData;
}

function fetchGetArticlesById(articleId) {
    if (articleId % 1 !== 0 || articleId <= 0) {
        return Promise.reject({ status: 400, error: "Invalid query" });
    }
    const sqlQuery = `
    SELECT
    articles.article_id,
    articles.title,
    articles.topic,
    articles.author,
    articles.body,
    articles.created_at,
    articles.votes,
    articles.article_img_url,
    COUNT(comments.comment_id) AS comment_count
    FROM
    articles
    LEFT JOIN comments ON articles.article_id = comments.article_id
    WHERE articles.article_id = $1
    GROUP BY articles.article_id
    ORDER BY created_at DESC`;
    return db.query(sqlQuery, [articleId]).then((response) => {
        if (response.rows.length === 0) {
            return Promise.reject({ status: 404, error: "Not found" });
        }
        return response;
    });
}

function fetchGetAllArticles(topicQuery, sortQuery, orderQuery, limitQuery, pageQuery) {
    const safeSortQueryList = ["article-id", "title", "topic", "author", "created_at", "votes", "comment_count"];
    if (!safeSortQueryList.includes(sortQuery)) {
        return Promise.reject({status: 404, error: "Not found"});
    }
    const safeSortQuery = `"${sortQuery}"`;
    const safeOrderQueryList = ["DESC", "ASC"];
    const orderQueryUC = orderQuery.toUpperCase();
    if (!safeOrderQueryList.includes(orderQueryUC)) {
        return Promise.reject({status: 404, error: "Not found"});
    }
    const safeOrderQuery = `${orderQueryUC}`;
    const offset = (pageQuery - 1) * limitQuery;
    let sqlQuery = `
    SELECT
    articles.article_id,
    articles.title,
    articles.topic,
    articles.author,
    articles.created_at,
    articles.votes,
    articles.article_img_url,
    COUNT(comments.comment_id) AS comment_count
    FROM
    articles
    LEFT JOIN comments ON articles.article_id = comments.article_id`;
    const values = [];

    if (topicQuery) {
        sqlQuery += ' WHERE articles.topic = $1';
        values.push(topicQuery);
    }

    sqlQuery += `
    GROUP BY articles.article_id
    ORDER BY ${safeSortQuery} ${safeOrderQuery}
    LIMIT $${values.length + 1}
    OFFSET $${values.length + 2};`;

    values.push(limitQuery, offset);

    return db.query(sqlQuery, values).then((response) => {
        if (response.rows.length === 0 && topicQuery) {
            return Promise.reject({ status: 404, error: "Not found" });
        }
        return response;
    });
}

function fetchGetCommentsByArticleId(articleId) {
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

function fetchPostCommentsByArticleId(articleId, username, body) {
    if (articleId % 1 !== 0 || articleId <= 0) {
        return Promise.reject({ status: 400, error: "Invalid query" });
    }
    if (!username || !body || typeof username !== "string" || typeof body !== "string") {
        return Promise.reject({ status: 400, error: "Invalid request body" })
    }
    const sqlQuery = `
    INSERT INTO comments (
        article_id,
        author,
        body,
        votes,
        created_at
    )
    VALUES
    ($1, $2, $3, 0, CURRENT_TIMESTAMP)
    RETURNING
    *`;
    return db.query(sqlQuery, [articleId, username, body]).then((response) => {
        if (response.rows.length === 0) {
            return Promise.reject({ status: 404, error: "Not found" });
        }
        return response;
    })
}

function fetchPatchArticleByArticleId(articleId, incVotes) {
    if (articleId % 1 !== 0 || articleId <= 0) {
        return Promise.reject({ status: 400, error: "Invalid query" });
    }
    if (typeof incVotes !== "number" || !incVotes) {
        return Promise.reject({ status: 400, error: "Invalid request body" });
    }
    const sqlQuery = `
    UPDATE articles
    SET votes = votes + $2
    WHERE article_id = $1
    RETURNING
    *`;
    return db.query(sqlQuery, [articleId, incVotes]).then((response) => {
        if (response.rows.length === 0) {
            return Promise.reject({ status: 404, error: "Not found" });
        }
        return response;
    });
}

function fetchDeleteCommentsByCommentId(commentId) {
    if (commentId <= 0 || commentId % 1 !== 0) {
        return Promise.reject({ status: 400, error: "Invalid query" })
    }
    const sqlQuery = `
    DELETE FROM comments
    WHERE comment_id = $1;`;
    return db.query(sqlQuery, [commentId]).then((response) => {
        if (response.rowCount === 0) {
            return Promise.reject({status: 404, error: "Not found"});
        }
        return response
    })
}

function fetchGetAllUsers() {
    const sqlQuery = `
    SELECT * FROM users;`;
    return db.query(sqlQuery).then((response) => {
        return response;
    });
}

function fetchGetUserByUsername(userName) {
    const sqlQuery = `
    SELECT * FROM users
    WHERE username = $1;`;
    return db.query(sqlQuery, [userName]).then((response) => {
        if (response.rows.length === 0) {
            return Promise.reject({status: 404, error: "Not found"});
        }
        return response;
    })
}

function fetchPatchCommentByCommentId(commentId, incVotes) {
    if (commentId % 1 !== 0 || commentId <= 0) {
        return Promise.reject({status: 400, error: "Invalid query"});
    };
    if (typeof incVotes !== "number" || !incVotes) {
        return Promise.reject({status: 400, error: "Invalid request body"});
    };
    const sqlQuery = `
    UPDATE comments
    SET votes = votes + $2
    WHERE comment_id = $1
    RETURNING
    *`;
    return db.query(sqlQuery, [commentId, incVotes]).then((response) => {
        if (response.rows.length === 0) {
            return Promise.reject({status: 404, error: "Not found"});
        }
        return response;
    })
}

function fetchPostArticle(newArticle) {
    const {author, title, body, topic, article_img_url} = newArticle;
    if (typeof author !== "string" || !author) {
        return Promise.reject({status: 400, error: "Invalid request body"})
    };
    if (typeof title !== "string" || !title) {
        return Promise.reject({status: 400, error: "Invalid request body"})
    };
    if (typeof body !== "string" || !body) {
        return Promise.reject({status: 400, error: "Invalid request body"})
    };
    if (typeof topic !== "string" || !topic) {
        return Promise.reject({status: 400, error: "Invalid request body"})
    };
    if (typeof article_img_url !== "string" || !article_img_url) {
        return Promise.reject({status: 400, error: "Invalid request body"})
    };
    const sqlQuery = `
    INSERT INTO articles (
        author,
        title,
        body,
        topic,
        article_img_url,
        created_at,
        votes
    )
    VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, 0)
    RETURNING article_id, author, title, body, topic, article_img_url, created_at, votes,
        (SELECT COUNT(*) FROM comments WHERE article_id = articles.article_id) AS comment_count;`;

    return db.query(sqlQuery, [author, title, body, topic, article_img_url]).then((response) => {
        if (response.rows.length === 0) {
            return Promise.reject({status: 404, error: "Not found"});
        }
        return response;
    })
}

module.exports = { fetchGetAllTopics, fetchGetAllApi, fetchGetArticlesById, fetchGetAllArticles, fetchGetCommentsByArticleId, fetchPostCommentsByArticleId, fetchPatchArticleByArticleId, fetchDeleteCommentsByCommentId, fetchGetAllUsers, fetchGetUserByUsername, fetchPatchCommentByCommentId, fetchPostArticle};