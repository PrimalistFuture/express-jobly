'use strict';

const db = require('../db.js');
const { BadRequestError, NotFoundError } = require('../expressError');
const Company = require('./company.js');
const {
	commonBeforeAll,
	commonBeforeEach,
	commonAfterEach,
	commonAfterAll,
} = require('./_testCommon');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe('create', function () {
	const newCompany = {
		handle: 'new',
		name: 'New',
		description: 'New Description',
		numEmployees: 1,
		logoUrl: 'http://new.img',
	};

	test('works', async function () {
		let company = await Company.create(newCompany);
		expect(company).toEqual(newCompany);

		const result = await db.query(
			`SELECT handle, name, description, num_employees, logo_url
           FROM companies
           WHERE handle = 'new'`
		);
		expect(result.rows).toEqual([
			{
				handle: 'new',
				name: 'New',
				description: 'New Description',
				num_employees: 1,
				logo_url: 'http://new.img',
			},
		]);
	});

	test('bad request with dupe', async function () {
		try {
			await Company.create(newCompany);
			await Company.create(newCompany);
			throw new Error("fail test, you shouldn't get here");
		} catch (err) {
			expect(err instanceof BadRequestError).toBeTruthy();
		}
	});
});

/************************************** findAll */

describe('findAll', function () {
	test('works: no filter', async function () {
		let companies = await Company.findAll();
		expect(companies).toEqual([
			{
				handle: 'c1',
				name: 'C1',
				description: 'Desc1',
				numEmployees: 1,
				logoUrl: 'http://c1.img',
			},
			{
				handle: 'c2',
				name: 'C2',
				description: 'Desc2',
				numEmployees: 2,
				logoUrl: 'http://c2.img',
			},
			{
				handle: 'c3',
				name: 'C3',
				description: 'Desc3',
				numEmployees: 3,
				logoUrl: 'http://c3.img',
			},
		]);
	});
});

/************************************** findWhere */
describe('findWhere', function () {
	test('works: returns array of companies', async function () {
		const companies = await Company.findWhere({ nameLike: 'c2' });
		expect(companies).toEqual([
			{
				handle: 'c2',
				name: 'C2',
				description: 'Desc2',
				numEmployees: 2,
				logoUrl: 'http://c2.img',
			},
		]);
		expect(Array.isArray(companies)).toEqual(true);
	});

	test('throws NotFoundError no results meet criteria', async function () {
		try {
			const companies = await Company.findWhere({ nameLike: 'Apple' });
			console.log(companies);
			throw Error('Fail Test: No Results');
		} catch (error) {
			expect(error instanceof NotFoundError).toBeTruthy();
		}
	});
});

/************************************** Company.sqlClauseForFindWhere */

describe('sqlClauseForFindWhere', function () {
	test('works: for one query parameter', function () {
		const result = Company.sqlClauseForFindWhere({
			minEmployees: 1,
		});
		expect(result).toEqual({ where: 'num_employees >= $1', values: [1] });
	});

	test('works: for multiple query parameters', function () {
		const result = Company.sqlClauseForFindWhere({
			minEmployees: 1,
			maxEmployees: 3,
			nameLike: '2',
		});
		expect(result).toEqual({
			where:
				"num_employees >= $1 AND num_employees <= $2 AND handle ILIKE '%'|| $3 ||'%'",
			values: [1, 3, '2'],
		});
	});

	test('throws bad request error if dataToSearch is empty', function () {
		try {
			const result = Company.sqlClauseForFindWhere({});
			throw new Error('Fail Test: no data');
		} catch (error) {
			expect(error instanceof BadRequestError).toBeTruthy();
		}
	});
	test('throws BadRequestError if minEmployees > maxEmployees', function () {
		try {
			const result = Company.sqlClauseForFindWhere({
				maxEmployees: 10,
				minEmployees: 30,
			});
			throw new Error('Fail Test: no data');
		} catch (error) {
			expect(error instanceof BadRequestError).toBeTruthy();
		}
	});
	test('throws BadRequestError if passed erroneous fields', function () {
		try {
			const result = Company.sqlClauseForFindWhere({
				description: 'Chill family-like atmosphere',
			});
			throw new Error('Fail Test: bad field');
		} catch (error) {
			expect(error instanceof BadRequestError).toBeTruthy();
		}
	});
});

/************************************** get */

describe('get', function () {
	test('works', async function () {
		let company = await Company.get('c1');
		expect(company).toEqual({
			handle: 'c1',
			name: 'C1',
			description: 'Desc1',
			numEmployees: 1,
			logoUrl: 'http://c1.img',
		});
	});

	test('not found if no such company', async function () {
		try {
			await Company.get('nope');
			throw new Error("fail test, you shouldn't get here");
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});
});

/************************************** update */

describe('update', function () {
	const updateData = {
		name: 'New',
		description: 'New Description',
		numEmployees: 10,
		logoUrl: 'http://new.img',
	};

	test('works', async function () {
		let company = await Company.update('c1', updateData);
		expect(company).toEqual({
			handle: 'c1',
			...updateData,
		});

		const result = await db.query(
			`SELECT handle, name, description, num_employees, logo_url
           FROM companies
           WHERE handle = 'c1'`
		);
		expect(result.rows).toEqual([
			{
				handle: 'c1',
				name: 'New',
				description: 'New Description',
				num_employees: 10,
				logo_url: 'http://new.img',
			},
		]);
	});

	test('works: null fields', async function () {
		const updateDataSetNulls = {
			name: 'New',
			description: 'New Description',
			numEmployees: null,
			logoUrl: null,
		};

		let company = await Company.update('c1', updateDataSetNulls);
		expect(company).toEqual({
			handle: 'c1',
			...updateDataSetNulls,
		});

		const result = await db.query(
			`SELECT handle, name, description, num_employees, logo_url
           FROM companies
           WHERE handle = 'c1'`
		);
		expect(result.rows).toEqual([
			{
				handle: 'c1',
				name: 'New',
				description: 'New Description',
				num_employees: null,
				logo_url: null,
			},
		]);
	});

	test('not found if no such company', async function () {
		try {
			await Company.update('nope', updateData);
			throw new Error("fail test, you shouldn't get here");
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});

	test('bad request with no data', async function () {
		try {
			await Company.update('c1', {});
			throw new Error("fail test, you shouldn't get here");
		} catch (err) {
			expect(err instanceof BadRequestError).toBeTruthy();
		}
	});
});

/************************************** remove */

describe('remove', function () {
	test('works', async function () {
		await Company.remove('c1');
		const res = await db.query(
			"SELECT handle FROM companies WHERE handle='c1'"
		);
		expect(res.rows.length).toEqual(0);
	});

	test('not found if no such company', async function () {
		try {
			await Company.remove('nope');
			throw new Error("fail test, you shouldn't get here");
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});
});
