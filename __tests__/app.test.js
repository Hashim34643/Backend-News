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
            //console.log(topics);
            expect(Array.isArray(topics)).toBe(true);
            expect(topics.length).toEqual(topicData.length);
            topics.forEach((topic) => {
                expect(typeof topic).toBe("object");
                expect(topic).toHaveProperty("slug")
                expect(topic).toHaveProperty("description")
            })
        })
    })
})

describe("GET /api", () => {
    test("Should return status 200 and endpoints.json", () => {
        return request(app).get("/api").expect(200).then((response) => {
            const endpoints = response.body.newEndpoints;
            //console.log(endpoints);
            for (const obj in endpoints) {
                const value = endpoints[obj];
                //console.log(value);
                //console.log(value.description);
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
    })
})