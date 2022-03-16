"use strict";
process.env.NODE_ENV = "test";
const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("../models/job");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testJobIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
    const newJob = {
        title: "Job1",
        salary: 1200,
        equity: "0.1",
        companyHandle: "c1"
    };

    test("works", async function () {
        let job = await Job.create(newJob);
        expect(job).toEqual({
            id: expect.any(Number), ...newJob
        });
    });
});

/************************************** findAll */

describe("findAll", function () {
    test("works: no filter", async function () {
        let jobs = await Job.findAll();
        expect(jobs).toEqual([
            {
                id: expect.any(Number),
                title: "JobAtc1",
                salary: 1000,
                equity: '0',
                companyHandle: "c1",
                companyName: "C1"
            },
            {
                id: expect.any(Number),
                title: "JobAtc2",
                salary: 2000,
                equity: '0.1',
                companyHandle: "c2",
                companyName: "C2"
            },
            {
                id: expect.any(Number),
                title: "JobAtc3",
                salary: 1500,
                equity: '0.2',
                companyHandle: "c3",
                companyName: "C3"
            },
        ]);
    });

    test("works: filter by min salary", async function () {
        let jobs = await Job.findAll({ minSalary: 1600 });
        expect(jobs).toEqual([
            {
                id: expect.any(Number),
                title: "JobAtc2",
                salary: 2000,
                equity: '0.1',
                companyHandle: "c2",
                companyName: "C2"
            }
        ]);
    });


    test("works: filter by hasEquity", async function () {
        let companies = await Job.findAll({ hasEquity: true });
        expect(companies).toEqual([
            {
                id: expect.any(Number),
                title: "JobAtc2",
                salary: 2000,
                equity: '0.1',
                companyHandle: "c2",
                companyName: "C2"
            },
            {
                id: expect.any(Number),
                title: "JobAtc3",
                salary: 1500,
                equity: '0.2',
                companyHandle: "c3",
                companyName: "C3"
            },
        ]);
    });

    test("works: filter by hasEquity and minSalary", async function () {
        let companies = await Job.findAll({ hasEquity: true, minSalary: 1900 });
        expect(companies).toEqual([
            {
                id: expect.any(Number),
                title: "JobAtc2",
                salary: 2000,
                equity: '0.1',
                companyHandle: "c2",
                companyName: "C2"
            },
        ]);
    });

    test("works: filter by title", async function () {
        let companies = await Job.findAll({ title: 'c1' });
        expect(companies).toEqual([
            {
                id: expect.any(Number),
                title: "JobAtc1",
                salary: 1000,
                equity: '0',
                companyHandle: "c1",
                companyName: "C1"
            },
        ]);
    });
});
/************************************** get */

describe("get", function () {
    test("works", async function () {
        let job = await Job.get(testJobIds[0]);
        expect(job).toEqual({
            id: testJobIds[0],
            title: "JobAtc1",
            salary: 1000,
            equity: '0',
            company: {
                description: "Desc1",
                handle: "c1",
                logoUrl: "http://c1.img",
                name: "C1",
                numEmployees: 1
            },

        });
    });

    test("not found if no such job", async function () {
        try {
            await Job.get(0);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

/************************************** update */

describe("update", function () {
    const updateData = {
        title: "New name",
        salary: 1234,
        equity:'0.15'
    };

    test("works", async function () {
        let job = await Job.update(testJobIds[0], updateData);
        expect(job).toEqual({
            id: testJobIds[0],
            companyHandle: "c1",
            ...updateData
        });
    });

    test("not found if no such job", async function () {
        try {
            await Job.update(0, updateData);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    test("bad request with no data", async function () {
        try {
            await Job.update("c1", {});
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

/************************************** remove */

describe("remove", function () {
    test("works", async function () {
        await Job.remove(testJobIds[0]);
        const res = await db.query(
            "SELECT id, title FROM jobs WHERE id = $1", [testJobIds[0]]);
        expect(res.rows.length).toEqual(0);
    });

    test("not found if no such Job", async function () {
        try {
            await Job.remove(0);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});
