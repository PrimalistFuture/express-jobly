const { BadRequestError } = require('../expressError');

/**
 * Accepts two objects, dataToUpdate and jsToSql.
 *  - dataToUpdate contains list of fields and values to update in DB
 *  - jsToSql contains transformations for camelCase to snake_case column names
 *
 * Returns object containing parameterized UPDATE clause for injection to SQL
 * query, and an array of the parameter values.
 *
 * Throws error if no data is provided.
 *
 * ACCEPTS:
 * 	dataToUpdate = {firstName: 'Aliya', age: 32}
 *
 * 	jsToSql = { firstName: 'first_name',
 * 							numEmployees: 'num_employees', ... }
 *
 * RETURNS: { setCols: '"first_name"=$1, "age"=$2',
 * 						values: [ 'Aliya', 32 ] }
 *
 */
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
	const keys = Object.keys(dataToUpdate);
	if (keys.length === 0) throw new BadRequestError('No data');

	// {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
	const cols = keys.map(
		(colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
	);

	return {
		setCols: cols.join(', '),
		values: Object.values(dataToUpdate),
	};
}

module.exports = { sqlForPartialUpdate };
