"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate, sqlForPartialGet } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
    /** Create a Job (from data), update db, return new Job data. 
     *
     * data should be {title, salary, equity, companyHandle }
     *
     * Returns { id, title, salary, equity, companyHandle  }
     *
     * Throws BadRequestError if Job already in database.
     * */

    static async create({ title, salary, equity, company_handle }) {
        const result = await db.query(
            `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING title, salary, equity, company_handle AS "companyHandle"`,
            [
                title, salary, equity, company_handle
            ],
        );
        const Job = result.rows[0];

        return Job;
    }

    /** Find all jobs.
     *
     * Returns [{ id, title, salary, equity, company_handle }, ...]
     * data may contain one or more of the following optional parameters:
     * minSalary
     * hasEquity (true returns only jobs with equity > 0, other values ignored)
     * title (will find case-insensitive, partial matches)
     * */

    static async findAll({ minSalary, hasEquity, title } = {}) {
        let query = `SELECT j.id,
                        j.title,
                        j.salary,
                        j.equity,
                        j.company_handle AS "companyHandle",
                        c.name AS "companyName"
                 FROM jobs j 
                   LEFT JOIN companies AS c ON c.handle = j.company_handle`;
        let whereExpressions = [];
        let queryValues = [];

        // For each possible search term, add to whereExpressions and
        // queryValues so we can generate the right SQL

        if (minSalary !== undefined) {
            queryValues.push(minSalary);
            whereExpressions.push(`salary >= $${queryValues.length}`);
        }

        if (hasEquity === true) {
            whereExpressions.push(`equity > 0`);
        }

        if (title !== undefined) {
            queryValues.push(`%${title}%`);
            whereExpressions.push(`title ILIKE $${queryValues.length}`);
        }

        if (whereExpressions.length > 0) {
            query += " WHERE " + whereExpressions.join(" AND ");
        }
        // Finalize query and return results
        query += " ORDER BY title";
        const jobsRes = await db.query(query, queryValues);
        return jobsRes.rows;

    }

    /** Given a Job id, return data about Job.
     *
     * Returns { id, title, salary, equity, company_handle}
     *   where jobs is [{ id, title, salary, equity, Jobid }, ...]
     *
     * Throws NotFoundError if not found.
     **/

    static async get(id) {
        const JobRes = await db.query(
            `SELECT id, title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE id = $1`,
            [id]);

        const Job = JobRes.rows[0];

        if (!Job) throw new NotFoundError(`No Job: ${id}`);

        const companiesRes = await db.query(
            `SELECT handle,
                    name,
                    description,
                    num_employees AS "numEmployees",
                    logo_url AS "logoUrl"
             FROM companies
             WHERE handle = $1`, [job.companyHandle]);

        delete job.companyHandle;
        job.company = companiesRes.rows[0];

        return Job;
    }

    /** Update Job data with `data`.
     *
     * This is a "partial update"
     *
     * Data can include: {title, salary, equity}
     *
     * Returns {id, title, salary, equity, companyHandle}
     *
     * Throws NotFoundError if not found.
     */

    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(
            data,
            {
                companyHandle: "company_handle",
            });
        const idVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, 
                      title, salary, equity, company_handle AS "companyHandle"`;
        const result = await db.query(querySql, [...values, id]);
        const Job = result.rows[0];

        if (!Job) throw new NotFoundError(`No Job: ${id}`);

        return Job;
    }

    /** Delete given Job from database; returns undefined.
     *
     * Throws NotFoundError if Job not found.
     **/

    static async remove(id) {
        const result = await db.query(
            `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
            [id]);
        const Job = result.rows[0];

        if (!Job) throw new NotFoundError(`No Job: ${id}`);
    }
}


module.exports = Job;
