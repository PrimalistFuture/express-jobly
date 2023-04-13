const { sqlForPartialUpdate } = require('./sql');
const { BadRequestError } = require('../expressError');

describe('sqlForPartialUpdate', function () {
	test('works: returns correct object with setCols and values properties', function () {
		const jsToSql = {
			numEmployees: 'num_employees',
			logoUrl: 'logo_url',
		};

		const result = sqlForPartialUpdate(
			{
				handle: 'acme',
				numEmployees: 14,
			},
			{
				numEmployees: 'num_employees',
				logoUrl: 'logo_url',
			}
		);
		expect(result).toEqual({
			setCols: '"handle"=$1, "num_employees"=$2',
			values: ['acme', 14],
		});
	});

	test('throws bad request error if dataToUpdate is empty', function () {
		try {
			const result = sqlForPartialUpdate(
				{},
				{ numEmployees: 'num_employees', logoUrl: 'logo_url' }
			);
			throw new Error('Fail Test');
		} catch (error) {
			expect(error instanceof BadRequestError).toBeTruthy();
		}
	});
});