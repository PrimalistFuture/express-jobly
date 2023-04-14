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
    job.equity =  parseFloat(job.equity)
        console.log(job, 'I am the job in create');
    return job;
  }



  /** Find all jobs.
   *
   * Returns [{ title, salaray, equity, companyHandle }, ...]
   * */

  static async findAll() {
    const jobsRes = await db.query(

    );
    return jobsRes.rows;
  }


  /** Find all companies that match given criteria object.
     * Accepts { maxEmployees: 2,
     *           nameLike: 'c1',
     *           minEmployees: 1
     *         }

     * Returns [
                { handle,
                  name,
                  description,
                  numEmployees,
                  logoUrl
                }, ...
              ]
     */
  static async findWhere(criteria) {
    // const { where, values } = Company.sqlClauseForFindWhere(criteria);
    // const companiesRes = await db.query(
    // 	`SELECT handle,
    //           name,
    //           description,
    //           num_employees AS "numEmployees",
    //           logo_url AS "logoUrl"
    //     FROM companies
    //     WHERE ${where}`,
    // 	values
    // );
    // const company = companiesRes.rows;

    // if (company.length === 0)
    // 	throw new NotFoundError('No companies match the criteria');

    // return company;
  }

  /** Return SQL to populate WHERE clause in findWhere function query.
   *  Accept one object, the search filter criteria
   *
   * 	ACCEPTS: { title: "net", minSalary: 20, hasEquity: 30 }
   *
   *  RETURNS: { where: "title ILIKE '%'|| $1 || '%' AND salary >= $2 AND hasEquity: $3"}
   * 							values: ['net', 20000, true]
   * 					 };
   *
   */
  static sqlClauseForFindWhere(dataToSearch) {
    // const keys = Object.keys(dataToSearch);
    // if (keys.length === 0) throw new BadRequestError('No data');

    // const validFields = ['minEmployees', 'maxEmployees', 'nameLike'];

    // if (dataToSearch?.minEmployees > dataToSearch?.maxEmployees) {
    //   throw new BadRequestError('Min employees cannot exceed max employees.');
    // }

    // const templateArray = keys.map((criteria, index) => {
    //   if (!validFields.includes(criteria))
    //     throw new BadRequestError('Invalid search criteria');
    //   const paramNum = index + 1;
    //   if (criteria === 'nameLike') {
    //     return `handle ILIKE '%'|| $${paramNum} ||'%'`;
    //   } else if (criteria === 'minEmployees') {
    //     return `num_employees >= $${paramNum}`;
    //   } else if (criteria === 'maxEmployees') {
    //     return `num_employees <= $${paramNum}`;
    //   }
    // });

    // return {
    //   where: templateArray.join(' AND '),
    //   values: Object.values(dataToSearch),
    // };
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

