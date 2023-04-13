'use strict';

const db = require('../db');
const { BadRequestError, NotFoundError } = require('../expressError');
const { sqlForPartialUpdate, sqlForSearchFilters } = require('../helpers/sql');

/** Related functions for companies. */

class Company {
	/** Create a company (from data), update db, return new company data.
	 *
	 * data should be { handle, name, description, numEmployees, logoUrl }
	 *
	 * Returns { handle, name, description, numEmployees, logoUrl }
	 *
	 * Throws BadRequestError if company already in database.
	 * */

	static async create({ handle, name, description, numEmployees, logoUrl }) {
		const duplicateCheck = await db.query(
			`SELECT handle
           FROM companies
           WHERE handle = $1`,
			[handle]
		);

		if (duplicateCheck.rows[0])
			throw new BadRequestError(`Duplicate company: ${handle}`);

		const result = await db.query(
			`INSERT INTO companies(
          handle,
          name,
          description,
          num_employees,
          logo_url)
           VALUES
             ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
			[handle, name, description, numEmployees, logoUrl]
		);
		const company = result.rows[0];

		return company;
	}

	/** Find all companies.
	 *
	 * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
	 * */

	static async findAll() {
		const companiesRes = await db.query(
			`SELECT handle,
                name,
                description,
                num_employees AS "numEmployees",
                logo_url AS "logoUrl"
           FROM companies
           ORDER BY name`
		);
		return companiesRes.rows;
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
		const { where, values } = Company.sqlClauseForFindWhere(criteria);
		const companiesRes = await db.query(
			`SELECT handle,
              name,
              description,
              num_employees AS "numEmployees",
              logo_url AS "logoUrl"
        FROM companies
        WHERE ${where}`,
			values
		);
		const company = companiesRes.rows;

		if (company.length === 0)
			throw new NotFoundError('No companies match the criteria');

		return company;
	}

/** Return SQL to populate WHERE clause in findWhere function query.
 *  Accept one object, the search filter criteria
 *
 * 	ACCEPTS: { nameLike: "net", minEmployees: 20, maxEmployees: 30 }
 *
 *  RETURNS: { where: "handle ILIKE '%'|| $1 || '%' AND num_employees >= $2",
 * 							values: ['net', 20]
 * 					 };
 *
 */
	static sqlClauseForFindWhere(dataToSearch) {
		const keys = Object.keys(dataToSearch);
		if (keys.length === 0) throw new BadRequestError('No data');

		const validFields = ['minEmployees', 'maxEmployees', 'nameLike'];

		if (dataToSearch?.minEmployees > dataToSearch?.maxEmployees) {
			throw new BadRequestError('Min employees cannot exceed max employees.');
		}

		const templateArray = keys.map((criteria, index) => {
			if (!validFields.includes(criteria))
				throw new BadRequestError('Invalid search criteria');
			const paramNum = index + 1;
			if (criteria === 'nameLike') {
				return `handle ILIKE '%'|| $${paramNum} ||'%'`;
			} else if (criteria === 'minEmployees') {
				return `num_employees >= $${paramNum}`;
			} else if (criteria === 'maxEmployees') {
				return `num_employees <= $${paramNum}`;
			}
		});

		return {
			where: templateArray.join(' AND '),
			values: Object.values(dataToSearch),
		};
	}

	/** Given a company handle, return data about company.
	 *
	 * Returns { handle, name, description, numEmployees, logoUrl, jobs }
	 *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
	 *
	 * Throws NotFoundError if not found.
	 **/

	static async get(handle) {
		const companyRes = await db.query(
			`SELECT handle,
                name,
                description,
                num_employees AS "numEmployees",
                logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`,
			[handle]
		);

		const company = companyRes.rows[0];

		if (!company) throw new NotFoundError(`No company: ${handle}`);

		return company;
	}

	/** Update company data with `data`.
	 *
	 * This is a "partial update" --- it's fine if data doesn't contain all the
	 * fields; this only changes provided ones.
	 *
	 * Data can include: {name, description, numEmployees, logoUrl}
	 *
	 * Returns {handle, name, description, numEmployees, logoUrl}
	 *
	 * Throws NotFoundError if not found.
	 */

	static async update(handle, data) {
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

	/** Delete given company from database; returns undefined.
	 *
	 * Throws NotFoundError if company not found.
	 **/

	static async remove(handle) {
		const result = await db.query(
			`DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
			[handle]
		);
		const company = result.rows[0];

		if (!company) throw new NotFoundError(`No company: ${handle}`);
	}
}

module.exports = Company;
