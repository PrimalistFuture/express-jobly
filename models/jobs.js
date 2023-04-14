'use strict';

const db = require('../db');
const { BadRequestError, NotFoundError } = require('../expressError');
const { sqlForPartialUpdate, sqlForSearchFilters } = require('../helpers/sql');


class Job {

  /** Create a job (from data), update db, return new job data.
     *
     * data should be { title, salaray, equity, companyHandle }
     *
     * Returns { title, salaray, equity, companyHandle }
     *
     * */


  static async create({ title, salary, equity, companyHandle }) {
    console.log({ title, salary, equity, companyHandle });
    const result = await db.query(
      `INSERT INTO jobs (
        title,
        salary,
        equity,
        company_handle)
      VALUES ($1, $2, $3, $4)
      RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
      [title, salary, equity, companyHandle]
      );

    let job = result.rows[0];

        console.log(job, 'I am the job in create');
    return job;
  }



  /** Find all jobs.
   *
   * Returns [{ id, title, salary, equity, companyHandle }, ...]
   * */

  static async findAll() {
    const jobsRes = await db.query(`
      SELECT id, title, salary, equity, company_handle AS "companyHandle"
        FROM jobs`);
    return jobsRes.rows;
  }


  /** Find all jobs that match given criteria object.
   *
     * Accepts { title: 'paper',
     *           hasEquity: true,
     *           minSalary: 20000
     *         }

     * Returns [
                { id,
                  title,
                  salary,
                  equity,
                  companyHandle
                }, ...
              ]
     */
  static async findWhere(criteria) {
    const { where, values } = Job.sqlClauseForFindWhere(criteria);
    const jobsResults = await db.query(
     `SELECT id,
             title,
             salary,
             equity,
             company_handle AS "companyHandle"
        FROM jobs
       WHERE ${where}`,
    	values
    );
    const jobs = jobsResults.rows;

    if (jobs.length === 0)
    	throw new NotFoundError('No jobs match the criteria');

    return jobs;
  }

  /** Return SQL to populate WHERE clause in findWhere function query.
   *  Accept one object, the search filter criteria
   *
   *  Can only accept the criteria: title, minSalary, and hasEquity.
   *
   * 	ACCEPTS: { title: "net", minSalary: 20, hasEquity: 30 }
   *
   *  RETURNS: { where: "title ILIKE '%'|| $1 || '%' AND salary >= $2 AND hasEquity: $3"}
   * 							values: ['net', 20000, true]
   * 					 };
   *
   */
  static sqlClauseForFindWhere(dataToSearch) {
    const keys = Object.keys(dataToSearch);
    if (keys.length === 0) throw new BadRequestError('No data');

    const validFields = ['title', 'minSalary', 'hasEquity'];

    const valuesArray = [];
    const templateArray = keys.map((criteria, index) => {
      if (!validFields.includes(criteria))
        throw new BadRequestError('Invalid search criteria');
      const paramNum = index + 1;
      if (criteria === 'title') {
        valuesArray.push(dataToSearch[criteria]);
        return `title ILIKE '%'|| $${paramNum} ||'%'`;
      } else if (criteria === 'minSalary') {
        valuesArray.push(dataToSearch[criteria]);
        return `salary >= $${paramNum}`;
      } else if (criteria === 'hasEquity' && dataToSearch[criteria] === true) {
        valuesArray.push('0.0');
        return `equity > $${paramNum}`;
      } else if (criteria === 'hasEquity' && dataToSearch[criteria] === false) {
        valuesArray.push('0.0');
        return `equity = $${paramNum}`;
      }

    });

    return {
      where: templateArray.join(' AND '),
      values: valuesArray,
    };
  }
  /** Given a job ID, return data about a single job.
   *
   *  Input: jobId
     *
     * Returns { title, salaray, equity, companyHandle }
     *
     * Throws NotFoundError if not found.
     **/

  static async get(jobId) {
    // const companyRes = await db.query(
    //   `SELECT handle,
    //             name,
    //             description,
    //             num_employees AS "numEmployees",
    //             logo_url AS "logoUrl"
    //        FROM companies
    //        WHERE handle = $1`,
    //   [handle]
    // );

    // const company = companyRes.rows[0];

    // if (!company) throw new NotFoundError(`No company: ${handle}`);

    // return company;
  }


  /** Update job at given jobId with data from `data` object.
     *
     * This is a "partial update" --- it's fine if data doesn't contain all the
     * fields; this only changes provided ones.
     *
     * Data can include: {title, salary, equity}
     *
     * Returns {title, salaray, equity, companyHandle}
     *
     * Throws NotFoundError if not found.
     * Throws BadRequestError if passing in id or companyHandle or no data
     */

  static async update(jobId, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      numEmployees: 'num_employees',
      logoUrl: 'logo_url',
    });
    const handleVarIdx = '$' + (values.length + 1);

    const querySql = `
    UPDATE companies
    SET ${setCols}
      WHERE handle = ${handleVarIdx}
      RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given job from database based on id; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/
  static async remove(id) {
    // const result = await db.query(
    //   `DELETE
    //        FROM companies
    //        WHERE handle = $1
    //        RETURNING handle`,
    //   [handle]
    // );
    // const company = result.rows[0];

    // if (!company) throw new NotFoundError(`No company: ${handle}`);
    // }
  }
}

module.exports = Job;

