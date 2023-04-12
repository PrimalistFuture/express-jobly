const { sqlForPartialUpdate, sqlForSearchFilters } = require('./sql');
const { BadRequestError } = require('../expressError');

const data = {
	handle: 'acme',
	name: 'The Royal Acme Corporation',
};

const jsToSql = {
	numEmployees: 'num_employees',
	logoUrl: 'logo_url',
};

const searchFilter = {
	minEmployees: 1,
};

const multipleSearchFilter = {
	nameLike: 'net',
	minEmployees: 30,
};

const misassignedEmployees = {
	maxEmployees: 10,
	minEmployees: 30,
};

const description = {
	description: 'Chill family-like atmosphere'
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

describe('sqlForSearchFilters', function () {
  test('returns a object', function () {
		const result = sqlForSearchFilters(searchFilter);
		expect(typeof result).toBe('object');
	});
  test('correctly handles one query parameter', function () {
		const result = sqlForSearchFilters(searchFilter);
		expect(result.values.length).toEqual(1);
		expect(result.where).toEqual('num_employees >= $1');

		const result2 = sqlForSearchFilters({maxEmployees:2});
		expect(result2.where).toEqual('num_employees <= $1');
	});

  test('correctly handles multiple query parameters', function () {
		const result = sqlForSearchFilters(multipleSearchFilter);
		expect(result.values.length).toEqual(2);
		expect(result.where).toEqual(
			`handle ILIKE '%'|| $1 ||'%' AND num_employees >= $2`
		);
	})

  test('throws bad request error if dataToSearch is empty', function () {
		try {
			const result = sqlForSearchFilters({});
			throw new Error('Fail Test: no data');
		} catch (error) {
			expect(error instanceof BadRequestError).toBeTruthy();
		};

	})
  test("throws BadRequestError if minEmployees > maxEmployees", function () {
		try {
			const result = sqlForSearchFilters(misassignedEmployees);
			throw new Error('Fail Test: no data');
		} catch (error) {
			expect(error instanceof BadRequestError).toBeTruthy();
		};
	})
  test("throws BadRequestError if passed erroneous fields", function () {
		try {
			const result = sqlForSearchFilters(description);
			throw new Error('Fail Test: bad field');
		} catch (error) {
			expect(error instanceof BadRequestError).toBeTruthy();
		}
	})
});
