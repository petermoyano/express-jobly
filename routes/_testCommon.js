"use strict";

const db = require("../db.js");
const User = require("../models/user");
const Company = require("../models/company");
const { createToken } = require("../helpers/tokens");
const Job = require("../models/job.js");


const testJobsId = [];
const testJobs = [];

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM companies");
    // noinspection SqlWithoutWhere
  await db.query("DELETE FROM jobs");
    // noinspection SqlWithoutWhere
  await db.query("DELETE FROM applications");

  await Company.create(
      {
        handle: "c1",
        name: "C1",
        numEmployees: 1,
        description: "Desc1",
        logoUrl: "http://c1.img",
      });
  await Company.create(
      {
        handle: "c2",
        name: "C2",
        numEmployees: 2,
        description: "Desc2",
        logoUrl: "http://c2.img",
      });
  await Company.create(
      {
        handle: "c3",
        name: "C3",
        numEmployees: 3,
        description: "Desc3",
        logoUrl: "http://c3.img",
      });

  await User.register({
    username: "u1",
    firstName: "U1F",
    lastName: "U1L",
    email: "user1@user.com",
    password: "password1",
    isAdmin: false,
  });
  await User.register({
    username: "u2",
    firstName: "U2F",
    lastName: "U2L",
    email: "user2@user.com",
    password: "password2",
    isAdmin: true,
  });
  await User.register({
    username: "u3",
    firstName: "U3F",
    lastName: "U3L",
    email: "user3@user.com",
    password: "password3",
    isAdmin: false,
  });

  
  const job1 = await Job.create({ title: "JobAtc1", salary: 1000, equity: 0.3, companyHandle: "c1" });
  const job2 = await Job.create({ title: "JobAtc2", salary: 2000, equity: 0.1, companyHandle: "c2" });
  const job3 = await Job.create({ title: "JobAtc3", salary: 1500, equity: 0.2, companyHandle: "c3" });

  testJobsId.push(job1.id, job2.id, job3.id);
  testJobs.push(job1, job2, job3);
  
  await User.apply(testJobsId[0], "u1");
  await User.apply(testJobsId[1], "u2");
  await User.apply(testJobsId[2], "u3");
 }

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}


const u1Token = createToken({username: "u1", isAdmin: false });
const u2Token = createToken({username: "u2", isAdmin: true});
const u3Token = createToken({username: "u3", isAdmin: false});


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
  u3Token,
  testJobs,
  testJobsId
};
