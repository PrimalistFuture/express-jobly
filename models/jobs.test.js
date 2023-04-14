'use strict';

const db = require('../db.js');
const { BadRequestError, NotFoundError } = require('../expressError');
const Job = require('./company.js');
const {
	commonBeforeAll,
	commonBeforeEach,
	commonAfterEach,
	commonAfterAll,
	jobIds,
} = require('./_testCommon');

let paperGirlId;
beforeAll(commonBeforeAll);

beforeAll(async () =>
{const result = await db.query(`
  SELECT id
  FROM jobs
  WHERE title = 'Paper Girl'
  LIMIT 1;`
  );
paperGirlId = result.rows[0].id;
});

beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

// ********************* create */

describe('create', function () {
	const newJob = {
		title: 'Paper Boy',
		salary: 12,
		equity: 0,
		company_handle: 'acme-paper',
	};

	test('works', async function () {
		let job = await Job.create(newJob);
		expect(job).toEqual({
			id: expect.any(Number),
			title: 'Paper Boy',
			salary: 12,
			equity: 0,
			company_handle: 'acme-paper',
		});

		const result = await db.query(
			`SELECT title, salary, equity, company_handle
      FROM jobs
      WHERE id = $1`,
			[job.id]
		);
		expect(
			result.rows[0].toEqual({
				id: expect.any(Number),
				title: 'Paper Boy',
				salary: 12,
				equity: 0,
				company_handle: 'acme-paper',
			})
		);
	});
});

/********************************* findAll */

describe('findAll', function () {
	test('works: no filter', async function () {
		let jobs = await Company.findAll();
		expect(jobs).toEqual([
			{
				title: 'Paper Boy',
				salary: 20000,
				equity: 0.005,
				company_handle: 'c1',
			},
			{
				title: 'Paper Girl',
				salary: 30000,
				equity: 0.1,
				company_handle: 'c2',
			},
			{
				title: 'Paper Man',
				salary: 10000,
				equity: 0.005,
				company_handle: 'c3',
			},
			{
				title: 'Paper Woman',
				salary: 10000,
				equity: 0.005,
				company_handle: 'c1',
			},
		]);
	});
});

/********************************** findWhere */
describe('findWhere', function () {
	test('works: returns array of jobs', async function () {
		const jobs = await Job.findWhere({ title: 'paper' });
		expect(jobs).toEqual([
			{
				title: 'Paper Boy',
				salary: 20000,
				equity: 0.005,
				company_handle: 'c1',
			},
		]);
	});
	test('throws NotFoundError if no results meet criteria', async function () {
		try {
			const jobs = await Job.findWhere({ title: 'Paper Being' });
			throw Error('Fail Test: Job.findWhere');
		} catch (error) {
			expect(error instanceof NotFoundError).toBeTruthy();
		}
	});
});

/************************************** Job.sqlClauseForFindWhere */
describe('sqlClauseForFindWhere', function () {
	test('works: for one query parameter', function () {
		const dataToSearch = { minSalary: 20000 };
		const results = Job.sqlClauseForFindWhere(dataToSearch);

		expect(results).toEqual({
			where: 'salary >= $1',
			values: [20000],
		});
	});
	test('works: for multiple query parameters', function () {
		const dataToSearch = { minSalary: 20000, hasEquity: true, title: 'paper' };
		const results = Job.sqlClauseForFindWhere(dataToSearch);

		expect(results).toEqual({
			where: "salary >= $1 AND equity > $2 AND title ILIKE '%'|| $3 ||'%'",
			values: [20000, 0.0, 'paper'],
		});
	});
	test('throws bad request error if dataToSearch is empty', function () {
		const dataToSearch = {};
		try {
			const results = Job.sqlClauseForFindWhere(dataToSearch);
			throw Error('Fail Test: Job.sqlClauseForFindWhere');
		} catch (error) {
			expect(error instanceof BadRequestError).toBeTruthy();
		}
	});
});

/************************************** get */

describe('get', function () {
	test('works', async function () {
		const paperGirlId = await db.query(`
      SELECT id
        FROM jobs
       WHERE title = 'Paper Girl'
       LIMIT 1;
    `);
		const results = Job.get(paperGirlId);
		expect(results).toEqual({
			id: expect.any(Number),
			title: 'Paper Girl',
			salary: 30000,
			equity: 0.1,
			company: 'c2',
		});
	});

	test('not found if no such job', async function () {
		const maxId = await db.query(`
      SELECT MAX(id)
        FROM jobs;
    `);

		try {
			const results = Job.get(maxId + 1);
			throw Error('Fail Test: Job.get');
		} catch (error) {
			expect(error instanceof NotFoundError).toBeTruthy();
		}
	});
});

/************************************** update */

describe('update', function () {
	test('works', async function () {
		const updateData = {
			title: 'CEO',
			salary: 1,
			equity: 0.5,
		};

		const result = Job.update(paperGirlId, updateData);
		expect(result).toEqual({
			id: expect.any(Number),
			title: 'CEO',
			salary: 1,
			equity: 0.5,
			company_handle: 'c2',
		});

		const resultInDb = await db.query(
			`
    SELECT id, title, salary, equity, company_handle
      FROM jobs
     WHERE id = $1`,
			[paperGirlId]
		);
		expect(resultInDb.rows).toEqual([
			{
				id: paperGirlId,
				title: 'CEO',
				salary: 1,
				equity: 0.5,
				company_handle: 'c2',
			},
		]);
	});

	test('works: null fields', async function () {
		const updateDataSetNulls = {
			salary: null,
			equity: null,
		};

		const result = await Job.update(paperGirlId, updateDataSetNulls);
		expect(result).toEqual({
			id: paperGirlId,
			title: 'CEO',
			salary: null,
			equity: null,
			company_handle: 'c2',
		});

		const resultInDb = await db.query(
			`
    SELECT id, title, salary, equity, company_handle
      FROM jobs
     WHERE id = $1`,
			[paperGirlId]
		);
		expect(resultInDb.rows).toEqual([
			{
				id: paperGirlId,
				title: 'CEO',
				salary: null,
				equity: null,
				company_handle: 'c2',
			},
		]);
	});

	test('bad request for trying to change company_handle', async function () {
		try {
			const result = Job.update(paperGirlId, { companyHandle: 'apple' });
			throw Error('Test Fail: Job.update');
		} catch (error) {
			expect(error instanceof BadRequestError).toBeTruthy();
		}
	});

	test('bad request for trying to change id', async function () {
		try {
			const result = Job.update(paperGirlId, { id: 4 });
			throw Error('Test Fail: Job.update');
		} catch (error) {
			expect(error instanceof BadRequestError).toBeTruthy();
		}
	});

	test('not found if no such job', async function () {
		const maxId = await db.query(`
    SELECT MAX(id)
      FROM jobs;`);
		try {
			const result = Job.update(maxId + 100, { salary: 5 });
			throw Error('Test Fail: Job.update');
		} catch (error) {
			expect(error instanceof NotFoundError).toBeTruthy();
		}
	});

	test('bad request with no data', async function () {
		try {
			const result = Job.update(paperGirlId, {});
			throw Error('Test Fail: Job.update');
		} catch (error) {
			expect(error instanceof BadRequestError).toBeTruthy();
		}
	});
});

/************************************** remove */

describe('remove', function () {
	test('works', async function () {
    await Job.remove(paperGirlId);
    const result = db.query(`
      SELECT id
        FROM jobs
        WHERE id = $1`,
        [paperGirlId])

    expect(result.rows.length).toEqual(0);
  });

	test('not found if no such job', async function () {
    const maxId = await db.query(`
    SELECT MAX(id)
      FROM jobs;`);
    try {
      await Job.remove(maxId + 1);
      throw new Error('Fail test, line should never run');
    } catch (error) {
      expect(error instanceof NotFoundError).toBeTruthy();
    }
  });
});
