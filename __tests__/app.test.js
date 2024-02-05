const request = require("supertest");
const db = require("../db/connection");
const { articleData, commentData, topicData, userData } = require("../db/data/test-data");
const app = require("../db/app");
const seed = require("../db/seeds/seed");
const models = require("../db/model/models");

beforeAll(() => {
    return seed({ articleData, commentData, topicData, userData });
})

afterAll(() => {
    return db.end();
})

describe("ERROR", () => {
    test("Should respond with 500 and send an error response in case of an error", () => {
        jest.spyOn(models, 'fetchGetAllTopics').mockRejectedValue(new Error("Internal Server Error"));
        return request(app).get("/api/topics").expect(500).then((response) => {
            const text = response.error.text;
            expect(text).toEqual("{\"status\":500,\"error\":\"Internal Server Error\"}");
            jest.restoreAllMocks();
        });
    });
})

describe("GET /api/topics", () => {
    test("Should respond with status 200 and topics data", () => {
        return request(app).get("/api/topics").expect(200).then((response) => {
            const topics = response.body;
            expect(Array.isArray(topics)).toBe(true);
            expect(topics.length).toEqual(topicData.length);
            if (topics.length > 0) {
                topics.forEach((topic) => {
                    expect(typeof topic).toBe("object");
                    expect(topic).toHaveProperty("slug")
                    expect(typeof topic.slug).toBe("string")
                    expect(topic).toHaveProperty("description")
                    expect(typeof topic.description).toBe("string");
                })
            }
        })
    });
})

describe("GET /api", () => {
    test("Should respond with status 200 and endpoints.json", () => {
        return request(app).get("/api").expect(200).then((response) => {
            const endpoints = response.body.newEndpoints;
            console.log(endpoints)
            for (const obj in endpoints) {
                const value = endpoints[obj];
                expect(typeof obj).toBe("string");
                if (value.description) {
                    expect(typeof value.description).toBe("string");
                }
                if (value.queries) {
                    expect(Array.isArray(value.queries)).toBe(true);
                }
                if (value.exampleResponse) {
                    expect(typeof value.exampleResponse).toBe("object");
                }
            }
        })
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
            expect(article).toHaveProperty("comment_count");
            expect(typeof article.comment_count).toBe("string");
            expect(article.comment_count).toBe("11");
        })
    });
    test("Should respond with 400 and send an error message if invalid id input", () => {
        return request(app).get("/api/articles/0").expect(400).then((response) => {
            const text = response.error.text;
            expect(text).toEqual("{\"status\":400,\"error\":\"Bad Request\",\"message\":\"Invalid query\"}");
        })
    });
    test("Should respond with 400 and send an error message if invalid id input", () => {
        return request(app).get("/api/articles/2.5").expect(400).then((response) => {
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
})

describe("GET /api/articles", () => {
    test("Should respond with 200 and return an array of articles", () => {
        return request(app).get("/api/articles").expect(200).then((response) => {
            const articles = response.body.articles;
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
                    expect(article).toHaveProperty("comment_count");
                    expect(typeof article.comment_count).toBe("string");
                })
            }
        })
    });
    test("Should be sorted by date", () => {
        return request(app).get("/api/articles").expect(200).then((response) => {
            const articles = response.body.articles;
            expect(articles).toBeSortedBy("created_at", { descending: true });
        })
    });
    describe("Get /api/articles?sort_by", () => {
        test("Should respond with 200 and an array of articles sorted by sort_by query", () => {
            return request(app).get("/api/articles?sort_by=title").expect(200).then((response) => {
                const articles = response.body.articles;
                expect(Array.isArray(articles)).toBe(true);
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
                        expect(article).toHaveProperty("comment_count");
                        expect(typeof article.comment_count).toBe("string");
                    })
                };
                expect(articles).toBeSortedBy("title", {descending: true});
            })
        });
        test("Should respond with 404 and an error message if passed invalid sort_by query", () => {
            return request(app).get("/api/articles?sort_by=password").expect(404).then((response) => {
                const text = response.error.text;
                expect(text).toBe("{\"status\":404,\"error\":\"Not Found\",\"message\":\"Not found\"}");
            })
        });
    });
    describe("Get /api/articles?order", () => {
        test("Should respond with 200 and an array of articles ordered by order query", () => {
            return request(app).get("/api/articles?order=asc").expect(200).then((response) => {
                const articles = response.body.articles;
                expect(Array.isArray(articles)).toBe(true);
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
                        expect(article).toHaveProperty("comment_count");
                        expect(typeof article.comment_count).toBe("string");
                    })
                };
                expect(articles).toBeSortedBy("created_at", {descending: false});
            })
        });
        test("Should respond with 404 and an error message if passed invalid order query", () => {
            return request(app).get("/api/articles?order=password").expect(404).then((response) => {
                const text = response.error.text;
                expect(text).toBe("{\"status\":404,\"error\":\"Not Found\",\"message\":\"Not found\"}");
            })
        });
    });
    describe("GET /api/articles?topic", () => {
        test("Should respond with 200 and an array of articles with only the topic in the topic query", () => {
            return request(app).get("/api/articles?topic=mitch").expect(200).then((response) => {
                const articles = response.body.articles;
                expect(Array.isArray(articles)).toBe(true);
                if (articles.length > 0) {
                    articles.forEach((article) => {
                        expect(typeof article).toBe("object");
                        expect(article).not.toHaveProperty("body");
                        expect(article).toHaveProperty("article_id");
                        expect(typeof article.article_id).toBe("number");
                        expect(article).toHaveProperty("title");
                        expect(typeof article.title).toBe("string");
                        expect(article).toHaveProperty("topic");
                        expect(article.topic).toBe("mitch");
                        expect(article).toHaveProperty("author");
                        expect(typeof article.author).toBe("string");
                        expect(article).toHaveProperty("created_at");
                        expect(typeof article.created_at).toBe("string");
                        expect(article).toHaveProperty("votes");
                        expect(typeof article.votes).toBe("number");
                        expect(article).toHaveProperty("article_img_url");
                        expect(typeof article.article_img_url).toBe("string");
                        expect(article).toHaveProperty("comment_count");
                        expect(typeof article.comment_count).toBe("string");
                    })
                };
            })
        });
        test("Should respond with 404 and an error message if passed invalid topic query", () => {
            return request(app).get("/api/articles?topic=password").expect(404).then((response) => {
                const text = response.error.text;
                expect(text).toBe("{\"status\":404,\"error\":\"Not Found\",\"message\":\"Not found\"}");
            })
        });
    });
})

describe("GET /api/articles/:article_id/comments", () => {
    test("Should respond with 200 and an array of comments belonging to the specific article id", () => {
        return request(app).get("/api/articles/1/comments").expect(200).then((response) => {
            const comments = response.body.comments;
            if (comments.length > 0) {
                expect(Array.isArray(comments)).toBe(true);
                comments.forEach((comment) => {
                    expect(typeof comment).toBe("object");
                    expect(comment).toHaveProperty("comment_id");
                    expect(typeof comment.comment_id).toBe("number");
                    expect(comment).toHaveProperty("body");
                    expect(typeof comment.body).toBe("string"); expect(comment).toHaveProperty("body");
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
    test("Should respond with 400 and send an error message if invalid id input", () => {
        return request(app).get("/api/articles/3.6/comments").expect(400).then((response) => {
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
})

describe("POST /api/articles/article_id/comments", () => {
    test("Should respond with 201 and add new comment", () => {
        return request(app).post("/api/articles/1/comments").send({
            username: "icellusedkars",
            body: "This is a test comment"
        }).expect(201).then((response) => {
            const text = response.body.comment;
            expect(typeof text).toBe("object");
            expect(text.body).toBe("This is a test comment");
            expect(text.article_id).toBe(1);
            expect(text.author).toBe("icellusedkars");
            expect(text.votes).toBe(0);
            expect(typeof text.created_at).toBe("string");
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
    test("Should respond with 400 and send an error message if invalid id input", () => {
        return request(app).post("/api/articles/5.3/comments").send({
            author: "testAuthor",
            body: "testBody"
        }).expect(400).then((response) => {
            const text = response.error.text;
            expect(text).toEqual("{\"status\":400,\"error\":\"Bad Request\",\"message\":\"Invalid query\"}");
        })
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

describe("PATCH /api/articles/:article_id", () => {
    const articleWithId1 = {
        title: "Living in the shadow of a great man",
        topic: "mitch",
        author: "butter_bridge",
        body: "I find this existence challenging",
        created_at: 1594329060000,
        votes: 100,
        article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    }
    test("Should respond with 200 and update comment", () => {
        return request(app).patch("/api/articles/1").send({ incVotes: 10 }).expect(200).then((response) => {
            const updatedArticle = response.body.comment;
            expect(typeof updatedArticle).toBe("object");
            expect(updatedArticle.article_id).toBe(1);
            expect(updatedArticle.title).toBe(articleWithId1.title);
            expect(updatedArticle.topic).toBe(articleWithId1.topic);
            expect(updatedArticle.body).toBe(articleWithId1.body);
            expect(updatedArticle.votes).not.toBe(articleWithId1.votes);
            expect(updatedArticle.votes).toBe(110);
            expect(updatedArticle.article_img_url).toBe(articleWithId1.article_img_url);
        })
    });
    test("Should respond with 400 and send an error message if invalid id input", () => {
        return request(app).patch("/api/articles/0").send({
            incVotes: 10
        }).expect(400).then((response) => {
            const text = response.error.text;
            expect(text).toEqual("{\"status\":400,\"error\":\"Bad Request\",\"message\":\"Invalid query\"}");
        })
    });
    test("Should respond with 400 and send an error message if invalid id input", () => {
        return request(app).patch("/api/articles/5.7").send({
            incVotes: 10
        }).expect(400).then((response) => {
            const text = response.error.text;
            expect(text).toEqual("{\"status\":400,\"error\":\"Bad Request\",\"message\":\"Invalid query\"}");
        })
    });
    test("Should respond with 404 and send an error message if valid id but does not exist in database", () => {
        return request(app).patch("/api/articles/123").send({
            incVotes: 10
        }).expect(404).then((response) => {
            const text = response.error.text;
            expect(text).toEqual("{\"status\":404,\"error\":\"Not Found\",\"message\":\"Not found\"}");
        });
    });
    test("Should respond with 400 and send an error message if request body is undefined", () => {
        return request(app).patch("/api/articles/1").send({}).expect(400).then((response) => {
            const text = response.error.text;
            expect(text).toBe("{\"status\":400,\"error\":\"Bad Request\",\"message\":\"Invalid request body\"}")
        })
    });
    test("Should respond with 400 and send an error message if request body is not a number", () => {
        return request(app).patch("/api/articles/1").send({ incVotes: "Hello" }).expect(400).then((response) => {
            const text = response.error.text;
            expect(text).toBe("{\"status\":400,\"error\":\"Bad Request\",\"message\":\"Invalid request body\"}")
        })
    });
})

describe("DELETE /api/comments/:comment_id", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });
    test("Should respond with 204 and no response", async () => {
        return request(app).delete("/api/comments/1").expect(204);
      });
    test("Should respond with 400 and error message if comment id is invalid", () => {
        return request(app).delete("/api/comments/0").expect(400).then((response) => {
            const text = response.error.text;
            expect(text).toBe("{\"status\":400,\"error\":\"Bad Request\",\"message\":\"Invalid query\"}")
        })
    });
    test("Should respond with 400 and error message if comment id is invalid", () => {
        return request(app).delete("/api/comments/2.3").expect(400).then((response) => {
            const text = response.error.text;
            expect(text).toBe("{\"status\":400,\"error\":\"Bad Request\",\"message\":\"Invalid query\"}")
        })
    });
    test("Should respond with 404 and error message if id is valid but not in database", () => {
        return request(app).delete("/api/comments/123").expect(404).then((response) => {
            const text = response.error.text;
            expect(text).toBe("{\"status\":404,\"error\":\"Not Found\",\"message\":\"Not found\"}")
        })
    });
})

describe("GET /api/users", () => {
    test("Should respond with 200 and send an array of all users data", () => {
        return request(app).get("/api/users").expect(200).then((response) => {
            const users = response.body;
            expect(Array.isArray(users)).toBe(true);
            users.forEach((user) => {
                expect(typeof user).toBe("object");
                expect(user).toHaveProperty("username");
                expect(typeof user.username).toBe("string");
                expect(user).toHaveProperty("name");
                expect(typeof user.name).toBe("string");
                expect(user).toHaveProperty("avatar_url");
                expect(typeof user.avatar_url).toBe("string");
            })
        })
    });
})

describe("GET /api/users/:username", () => {
    test("Should respond with 200 and return specified user data", () => {
        return request(app).get("/api/users/butter_bridge").expect(200).then((response) => {
            const user = response.body;
            expect(typeof user).toBe("object");
            expect(user).toEqual(
                expect.objectContaining({
                    username: expect.any(String),
                    name: expect.any(String),
                    avatar_url: expect.any(String)        
                })
            );
        });
    });
    test("Should respond with 404 and error message if username does not exist", () => {
        return request(app).get("/api/users/hrstdbdjstsr.ss554#$^%^3").then((response) => {
            const text = response.error.text;
            expect(text).toBe("{\"status\":404,\"error\":\"Not Found\",\"message\":\"Not found\"}")
        })
    })
})

describe("PATCH /api/comments/:comment_id", () => {
    const commentWithId2 = {
        body: "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
        votes: 14,
        author: "butter_bridge",
        article_id: 1,
        created_at: 1604113380000,
    };
    test("Should respond with 200 and send the updated comment", () => {
        return request(app).patch("/api/comments/2").send({incVotes: 10}).expect(200).then((response) => {
            const comment = response.body.comment;
            expect(typeof comment).toBe("object");
            expect(comment).toEqual(
                expect.objectContaining({
                comment_id: expect.any(Number),
                body: expect.any(String),
                article_id: expect.any(Number),
                author: expect.any(String),
                votes: expect.any(Number),
                created_at: expect.any(String) 
                })
            )
        })
    });
    test("Should respond with 400 and send an error message if invalid id input", () => {
        return request(app).patch("/api/comments/0").send({
            incVotes: 10
        }).expect(400).then((response) => {
            const text = response.error.text;
            expect(text).toEqual("{\"status\":400,\"error\":\"Bad Request\",\"message\":\"Invalid query\"}");
        })
    });
    test("Should respond with 400 and send an error message if invalid id input", () => {
        return request(app).patch("/api/comments/5.7").send({
            incVotes: 10
        }).expect(400).then((response) => {
            const text = response.error.text;
            expect(text).toEqual("{\"status\":400,\"error\":\"Bad Request\",\"message\":\"Invalid query\"}");
        })
    });
    test("Should respond with 404 and send an error message if valid id but does not exist in database", () => {
        return request(app).patch("/api/comments/123").send({
            incVotes: 10
        }).expect(404).then((response) => {
            const text = response.error.text;
            expect(text).toEqual("{\"status\":404,\"error\":\"Not Found\",\"message\":\"Not found\"}");
        });
    });
    test("Should respond with 400 and send an error message if request body is undefined", () => {
        return request(app).patch("/api/comments/1").send({}).expect(400).then((response) => {
            const text = response.error.text;
            expect(text).toBe("{\"status\":400,\"error\":\"Bad Request\",\"message\":\"Invalid request body\"}")
        })
    });
    test("Should respond with 400 and send an error message if request body is not a number", () => {
        return request(app).patch("/api/comments/1").send({ incVotes: "Hello" }).expect(400).then((response) => {
            const text = response.error.text;
            expect(text).toBe("{\"status\":400,\"error\":\"Bad Request\",\"message\":\"Invalid request body\"}")
        })
    });
});

describe("POST /api/articles", () => {
    test("Should respond with 201 and send the newly created article data", () => {
        return request(app).post("/api/articles").send({
            title: "Post /api/article test title",
            topic: "mitch",
            author: "butter_bridge",
            body: "Test",
            article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700" 
        }).expect(201).then((response) => {
            const article = response.body.article;
            expect(typeof article).toBe("object");
            expect(article).toEqual(
                expect.objectContaining({
                    article_id: expect.any(Number),
                    author: expect.any(String),
                    title: expect.any(String),
                    body: expect.any(String),
                    topic: expect.any(String),
                    article_img_url: expect.any(String),
                    created_at: expect.any(String),
                    votes: expect.any(Number),
                    comment_count: expect.any(String)
                })
            );
        });
    });
    test("Should respond with 400 and send an error message if request body is missing", () => {
        return request(app).post("/api/articles").send({}).expect(400).then((response) => {
            const text = response.error.text;
            expect(text).toEqual("{\"status\":400,\"error\":\"Bad Request\",\"message\":\"Invalid request body\"}");
        });
    });
    test("Should respond with 400 and send an error message if request body doesn't match requirements", () => {
        return request(app).post("/api/articles").send({
            author: 33,
            body: "testBody"
        }).expect(400).then((response) => {
            const text = response.error.text;
            expect(text).toEqual("{\"status\":400,\"error\":\"Bad Request\",\"message\":\"Invalid request body\"}");
        });
    });
})