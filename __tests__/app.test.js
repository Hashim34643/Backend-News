const request = require("supertest");
const db = require("/home/hashim/northcoders/backend/be-nc-news/db/connection.js");
const {articleData, commentData, topicData, userData} = require("/home/hashim/northcoders/backend/be-nc-news/db/data/test-data/index.js");
const app = require("/home/hashim/northcoders/backend/be-nc-news/db/app.js");
const seed = require("/home/hashim/northcoders/backend/be-nc-news/db/seeds/seed.js");
const models = require("/home/hashim/northcoders/backend/be-nc-news/db/models.js");

beforeAll(() => {
    return seed({articleData, commentData, topicData, userData});
})

afterAll(() => {
    return db.end();
})

describe("GET /api/topics", () => {
    test("Should return status 200 and topics data", () => {
        return request(app).get("/api/topics").expect(200).then((response) => {
            const topics = response.body.response.rows;
            expect(Array.isArray(topics)).toBe(true);
            expect(topics.length).toEqual(topicData.length);
            if (topics.length > 0) {
            topics.forEach((topic) => {
                expect(typeof topic).toBe("object");
                expect(topic).toHaveProperty("slug")
                expect(topic).toHaveProperty("description")
            })
          }
        })
    });
    test("Should respond with 500 and send an error response in case of an error", () => {
        jest.spyOn(models, 'fetchAllTopics').mockRejectedValue(new Error("Database query error"));
        return request(app).get("/api/topics").expect(500).then((response) => {
            const text = response.error.text;
            expect(text).toEqual("{\"status\":500,\"error\":\"Internal Server Error\"}");
        });
    });
})

describe("GET /api", () => {
    test("Should return status 200 and endpoints.json", () => {
        return request(app).get("/api").expect(200).then((response) => {
            const endpoints = response.body.newEndpoints;
            for (const obj in endpoints) {
                const value = endpoints[obj];
                expect(typeof obj).toBe("string");
                if (value.description){
                    expect(typeof value.description).toBe("string");
                }
                if (value.queries){
                    expect(Array.isArray(value.queries)).toBe(true);
                }
                if (value.exampleResponse) {
                    expect(typeof value.exampleResponse).toBe("object");
                }
            }
        })
    });
    test("Should respond with 500 and send an error response in case of an error", () => {
        jest.spyOn(models, 'fetchAllApi').mockRejectedValue(new Error("Database query error"));
        return request(app).get("/api").expect(500).then((response) => {
            const text = response.error.text;
            expect(text).toEqual("{\"status\":500,\"error\":\"Internal Server Error\"}");
        });
    });
})

describe("GET /api/articles/:article_id", () => {
    test("Should respond with status 200 and an object containing article data", () => {
        return request(app).get("/api/articles/1").expect(200).then((response) => {
            const article = response.body.article;
            expect(typeof article).toBe("object");
            expect(article).toHaveProperty("article_id");
            expect(typeof article.article_id).toBe("number");
            expect(article.article_id).toBe(1);
            expect(article).toHaveProperty("title");
            expect(typeof article.title).toBe("string");
            expect(article.title).toBe("Living in the shadow of a great man");
            expect(article).toHaveProperty("topic");
            expect(typeof article.topic).toBe("string");
            expect(article.topic).toBe("mitch");
            expect(article).toHaveProperty("author");
            expect(typeof article.author).toBe("string");
            expect(article.author).toBe("butter_bridge");
            expect(article).toHaveProperty("body");
            expect(typeof article.body).toBe("string");
            expect(article.body).toBe("I find this existence challenging");
            expect(article).toHaveProperty("created_at");
            expect(typeof article.created_at).toBe("string");
            expect(article.created_at).toBe("2020-07-09T20:11:00.000Z");
            expect(article).toHaveProperty("votes");
            expect(typeof article.votes).toBe("number");
            expect(article.votes).toBe(100);
            expect(article).toHaveProperty("article_img_url");
            expect(typeof article.article_img_url).toBe("string");
            expect(article.article_img_url).toBe("https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700");
        })
    });
    test("Should respond with 400 and send an error message if invalid id input", () => {
        return request(app).get("/api/articles/0").expect(400).then((response) => {
            const text = response.error.text;
            expect(text).toEqual("{\"status\":400,\"error\":\"Bad Request\",\"message\":\"Invalid query\"}");
        })
    });
    test("Should respond with 404 and send an error message if valid id but does not exist in database", () => {
        return request(app).get("/api/articles/123").expect(404).then((response) => {
            const text = response.error.text;
            expect(text).toEqual("{\"status\":404,\"error\":\"Not Found\",\"message\":\"Not found\"}");
        });
    });
    test("Should respond with 500 and send an error response in case of an error", () => {
        jest.spyOn(models, 'fetchArticlesById').mockRejectedValue(new Error("Database query error"));
        return request(app).get("/api/articles/1").expect(500).then((response) => {
            const text = response.error.text;
            expect(text).toEqual("{\"status\":500,\"error\":\"Internal Server Error\"}");
        });
    });
})

describe("GET /api/articles", () => {
    test("Should respond with 200 and return an array of objects containing articles data", () => {
        return request(app).get("/api/articles").expect(200).then((response) => {
            const articles = response.body.response.rows;
            if (articles.length > 0) {
            articles.forEach((article) => {
                expect(typeof article).toBe("object");
                expect(article).not.toHaveProperty("body");
                expect(article).toHaveProperty("article_id");
                expect(typeof article.article_id).toBe("number");
                expect(article).toHaveProperty("title");
                expect(typeof article.title).toBe("string");
                expect(article).toHaveProperty("topic");
                expect(typeof article.topic).toBe("string");
                expect(article).toHaveProperty("author");
                expect(typeof article.author).toBe("string");
                expect(article).toHaveProperty("created_at");
                expect(typeof article.created_at).toBe("string");
                expect(article).toHaveProperty("votes");
                expect(typeof article.votes).toBe("number");
                expect(article).toHaveProperty("article_img_url");
                expect(typeof article.article_img_url).toBe("string");
            })
          }
        })
    });
    test("Should be sorted by date", () => {
        return request(app).get("/api/articles").expect(200).then((response) => {
            const articles = response.body.response.rows;
            expect(articles).toBeSortedBy("created_at", {descending: true});
        })
    });
    test("Should respond with 500 and send an error response in case of an error", () => {
        jest.spyOn(models, 'fetchAllArticles').mockRejectedValue(new Error("Database query error"));
        return request(app).get("/api/articles").expect(500).then((response) => {
            const text = response.error.text;
            expect(text).toEqual("{\"status\":500,\"error\":\"Internal Server Error\"}");
        });
    });
})

describe("GET /api/articles/:article_id/comments", () => {
    test("Should respond with 200 and an array of comments belonging to the specific article id", () => {
        return request(app).get("/api/articles/1/comments").expect(200).then((response) => {
            const comments = response.body.response.rows;
            if (comments.length > 0) {
            expect(Array.isArray(comments)).toBe(true);
            comments.forEach((comment) => {
                expect(typeof comment).toBe("object");
                expect(comment).toHaveProperty("comment_id");
                expect(typeof comment.comment_id).toBe("number");
                expect(comment).toHaveProperty("body");
                expect(typeof comment.body).toBe("string");                expect(comment).toHaveProperty("body");
                expect(comment).toHaveProperty("article_id");
                expect(typeof comment.article_id).toBe("number");
                expect(comment).toHaveProperty("author");
                expect(typeof comment.author).toBe("string");
                expect(comment).toHaveProperty("votes");
                expect(typeof comment.votes).toBe("number");
                expect(comment).toHaveProperty("created_at");
                expect(typeof comment.created_at).toBe("string");
            });
        }
            expect(comments[0]).toEqual({
                comment_id: 5,
                body: 'I hate streaming noses',
                article_id: 1,
                author: 'icellusedkars',
                votes: 0,
                created_at: '2020-11-03T21:00:00.000Z'
              });
        })
    });
    test("Should respond with 400 and send an error message if invalid id input", () => {
        return request(app).get("/api/articles/0/comments").expect(400).then((response) => {
            const text = response.error.text;
            expect(text).toEqual("{\"status\":400,\"error\":\"Bad Request\",\"message\":\"Invalid query\"}");
        })
    });
    test("Should respond with 404 and send an error message if valid id but does not exist in database", () => {
        return request(app).get("/api/articles/123/comments").expect(404).then((response) => {
            const text = response.error.text;
            expect(text).toEqual("{\"status\":404,\"error\":\"Not Found\",\"message\":\"Not found\"}");
        });
    });
    test("Should respond with 500 and send an error response in case of an error", () => {
        jest.spyOn(models, 'fetchCommentsByArticleId').mockRejectedValue(new Error("Database query error"));
        return request(app).get("/api/articles/1/comments").expect(500).then((response) => {
            const text = response.error.text;
            expect(text).toEqual("{\"status\":500,\"error\":\"Internal Server Error\"}");
        });
    });
})

describe("POST /api/articles/article_id/comments", () => {
    test("Should respond with 201 and add new comment", () => {
        const commentExample = {
            rows: [
                {
                    body: "This is a test comment",
                    article_id: 1,
                    author: "Test",
                    votes: 0,
                    created_at: Date.now()
                }
            ]
        };
        jest.spyOn(models, "fetchPostCommentsByArticleId").mockResolvedValueOnce(commentExample);
        return request(app).post("/api/articles/1/comments").send({
            author: "",
            body: ""
        }).expect(201).then((response) => {
            const parsedText = JSON.parse(response.text);
            const text = parsedText.response.rows[0];
            expect(typeof text).toBe("object");
            expect(text.body).toBe("This is a test comment");
            expect(text.article_id).toBe(1);
            expect(text.author).toBe("Test");
            expect(text.votes).toBe(0);
            expect(typeof text.created_at).toBe("number");     
        })
    });
    test("Should respond with 400 and send an error message if invalid id input", () => {
        return request(app).post("/api/articles/0/comments").send({
            author: "testAuthor",
            body: "testBody"
        }).expect(400).then((response) => {
            const text = response.error.text;
            expect(text).toEqual("{\"status\":400,\"error\":\"Bad Request\",\"message\":\"Invalid query\"}");
        })
    });
    test("Should respond with 500 and send an error message if valid id but does not exist in database", () => {
        return request(app).post("/api/articles/123/comments").send({
            author: "testAuthor",
            body: "testBody"
        }).expect(500).then((response) => {
            const text = response.error.text;
            expect(text).toEqual("{\"status\":500,\"error\":\"Internal Server Error\"}");
        });
    });
    test("Should respond with 500 and send an error message in case of an error", () => {
        jest.spyOn(models, 'fetchCommentsByArticleId').mockRejectedValue(new Error("Database query error"));
        return request(app).post("/api/articles/1/comments").send({
            author: "testAuthor",
            body: "testBody"
        }).expect(500).then((response) => {
            const text = response.error.text;
            expect(text).toEqual("{\"status\":500,\"error\":\"Internal Server Error\"}");
        });  
    });
    test("Should respond with 400 and send an error message if request body is missing", () => {
        return request(app).post("/api/articles/1/comments").send({}).expect(400).then((response) => {
            const text = response.error.text;
            expect(text).toEqual("{\"status\":400,\"error\":\"Bad Request\",\"message\":\"Invalid request body\"}");
        });
    });
    test("Should respond with 400 and send an error message if request body doesn't match requirements", () => {
        return request(app).post("/api/articles/1/comments").send({
            author: 33,
            body: "testBody"
        }).expect(400).then((response) => {
            const text = response.error.text;
            expect(text).toEqual("{\"status\":400,\"error\":\"Bad Request\",\"message\":\"Invalid request body\"}");
        });
    });
})

