const { sqlForPartialUpdate } = require('./sql');
const { BadRequestError } = require('../expressError');

const data = {
	handle: 'acme',
	name: 'The Royal Acme Corporation',
};

const jsToSql = {
	numEmployees: 'num_employees',
	logoUrl: 'logo_url',
};

describe('sqlForPartialUpdate', function () {
	test('returns an object', function () {
		const result = sqlForPartialUpdate(data, jsToSql);
		expect(typeof result).toBe('object');
	});

	test('setCols is a string of paramaterized values', function () {
		const { setCols, values } = sqlForPartialUpdate(data, jsToSql);
		expect(typeof setCols).toBe('string');
		expect(setCols).toEqual('"handle"=$1, "name"=$2');
	});

	test('values is an array of strings', function () {
		const { setCols, values } = sqlForPartialUpdate(data, jsToSql);
		expect(Array.isArray(values)).toBe(true);
		expect(values).toEqual(['acme', 'The Royal Acme Corporation']);
	});

	test('throws bad request error if dataToUpdate is empty', function () {
		try {
			const result = sqlForPartialUpdate({}, jsToSql);
			throw new Error('Fail Test');
		} catch (error) {
			expect(error instanceof BadRequestError).toBeTruthy();
		}
	});
});
