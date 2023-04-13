const { BadRequestError } = require('../expressError');

// TODO: Update this dosctring to include examples of inputs and outputs
/** Takes in an object to update and an object that translates JS to SQL
 * transforms data to update into an array of columns and parameterized variables
 * returns string with comma seperated data and
 *  another array of values from the original input
 *  that will become the new field values in the database
 *
 * throws error if no data is provided
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

/** Return SQL to populate WHERE clause in search-related SQL queries.
 *  Accept one object, the search filter criteria
 *  TODO: not arbitary, give it the 3rd one too
 * 	ACCEPTS: { nameLike: "net", minEmployees: 20 }
 *
 *  RETURNS: { where: "handle ILIKE '%'|| $1 || '%' AND num_employees >= $2",
 * 							values: ['net', 20]
 * 					 };
 *
 */
//TODO: rename and put in companies model as it is
//not general purpose enough for this file
function sqlForSearchFilters(dataToSearch) {
	const keys = Object.keys(dataToSearch);
	if (keys.length === 0) throw new BadRequestError('No data');

	const validFields = ['minEmployees', 'maxEmployees', 'nameLike'];

	// TODO: Would using schema validation be better here?
	if (dataToSearch?.minEmployees > dataToSearch?.maxEmployees) {
		throw new BadRequestError('Min employees cannot exceed max employees.');
	}

	const templateArray = keys.map((criteria, index) => {
		if (!validFields.includes(criteria))
			throw new BadRequestError('Invalid search criteria');
			//TODO: param is not entirely true, should be num
		const param = index + 1;
		if (criteria === 'nameLike') {
			return `handle ILIKE '%'|| $${param} ||'%'`;
		} else if (criteria === 'minEmployees') {
			return `num_employees >= $${param}`;
		} else if (criteria === 'maxEmployees') {
			return `num_employees <= $${param}`;
		}
	});

	return {
		where: templateArray.join(' AND '),
		values: Object.values(dataToSearch),
	};
}

module.exports = { sqlForPartialUpdate, sqlForSearchFilters };
