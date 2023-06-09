'use strict';

const db = require('../db.js');
const { BadRequestError, NotFoundError } = require('../expressError');
const Job = require('./jobs.js');
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
console.log(paperGirlId, 'I am papergirlid')
});


beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

// ********************* create */

describe('create', function () {
  console.log('entering create describe block')
	const newJob = {
		title: 'Paper Boy',
		salary: 12,
		equity: '0',
		companyHandle: 'c1',
	};

	test('works', async function () {
    console.log('Entering create-works')
		let job = await Job.create(newJob);
    console.log(job, 'I am the job');
		expect(job).toEqual({
			id: expect.any(Number),
			title: 'Paper Boy',
			salary: 12,
			equity: '0',
			companyHandle: 'c1',
		});
    console.log('Just about to enter result');
		const result = await db.query(
			`SELECT id, title, salary, equity, company_handle as "companyHandle"
      FROM jobs
      WHERE id = $1`,
			[job.id]
		);
		expect(
			result.rows[0]).toEqual({
				id: expect.any(Number),
				title: 'Paper Boy',
				salary: 12,
				equity: '0',
				companyHandle: 'c1',
			});
	});
});

/********************************* findAll */

describe('findAll', function () {
	test('works: no filter', async function () {
		let jobs = await Job.findAll();
		expect(jobs).toEqual([
			{
				id: expect.any(Number),
        title: 'Paper Boy',
				salary: 20000,
				equity: '0.005',
				companyHandle: 'c1',
			},
			{
        id: expect.any(Number),
				title: 'Paper Girl',
				salary: 30000,
				equity: '0.1',
				companyHandle: 'c2',
			},
			{
        id: expect.any(Number),
				title: 'Paper Man',
				salary: 10000,
				equity: '0.005',
				companyHandle: 'c3',
			},
			{
        id: expect.any(Number),
				title: 'Paper Woman',
				salary: 10000,
				equity: '0.005',
				companyHandle: 'c1',
			},
		]);
	});
});

/********************************** findWhere */
describe('findWhere', function () {

	test('works: returns array of jobs', async function () {
		const jobs = await Job.findWhere({ title: 'paper boy' });
		expect(jobs).toEqual([
			{
        id: expect.any(Number),
				title: 'Paper Boy',
				salary: 20000,
				equity: '0.005',
				companyHandle: 'c1',
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

// /************************************** Job.sqlClauseForFindWhere */
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
			values: [20000, '0.0', 'paper'],
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

  test('throws bad request error if dataToSearch has invalid field', function () {
		const dataToSearch = { description: 'A chill atmosphere.'};
		try {
			const results = Job.sqlClauseForFindWhere(dataToSearch);
			throw Error('Fail Test: Job.sqlClauseForFindWhere');
		} catch (error) {
			expect(error instanceof BadRequestError).toBeTruthy();
		}
	});
});

// /************************************** get */

describe('get', function () {
	test('works', async function () {
		const results = await Job.get(paperGirlId);
		expect(results).toEqual({
			id: expect.any(Number),
			title: 'Paper Girl',
			salary: 30000,
			equity: '0.1',
			companyHandle: 'c2',
		});
	});

	test('not found if no such job', async function () {
		let maxId = await db.query(`
      SELECT MAX(id)
        FROM jobs;
    `);

    maxId = maxId.rows[0].max;

		try {
			const results = await Job.get(maxId + 1);
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
			equity: '0.5',
		};

		const result = await Job.update(paperGirlId, updateData);
		expect(result).toEqual({
			id: expect.any(Number),
			title: 'CEO',
			salary: 1,
			equity: '0.5',
			companyHandle: 'c2',
		});

		const resultInDb = await db.query(
			`
    SELECT id, title, salary, equity, company_handle AS "companyHandle"
      FROM jobs
     WHERE id = $1`,
			[paperGirlId]
		);
		expect(resultInDb.rows).toEqual([
			{
				id: paperGirlId,
				title: 'CEO',
				salary: 1,
				equity: '0.5',
				companyHandle: 'c2',
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
			title: 'Paper Girl',
			salary: null,
			equity: null,
			companyHandle: 'c2',
		});

		const resultInDb = await db.query(
			`
    SELECT id, title, salary, equity, company_handle AS "companyHandle"
      FROM jobs
     WHERE id = $1`,
			[paperGirlId]
		);
		expect(resultInDb.rows).toEqual([
			{
				id: paperGirlId,
				title: 'Paper Girl',
				salary: null,
				equity: null,
				companyHandle: 'c2',
			},
		]);
	});

	test('bad request for trying to change company_handle', async function () {
		try {
			const result = await Job.update(paperGirlId, { companyHandle: 'apple' });
			throw Error('Test Fail: Job.update');
		} catch (error) {
			expect(error instanceof BadRequestError).toBeTruthy();
		}
	});

	test('bad request for trying to change id', async function () {
		try {
			const result = await Job.update(paperGirlId, { id: 4 });
			throw Error('Test Fail: Job.update');
		} catch (error) {
			expect(error instanceof BadRequestError).toBeTruthy();
		}
	});

	test('not found if no such job', async function () {
		let maxId = await db.query(`
      SELECT MAX(id)
        FROM jobs;
    `);

    maxId = maxId.rows[0].max;
		try {
			const result = await Job.update(maxId + 100, { salary: 5 });
			throw Error('Test Fail: Job.update');
		} catch (error) {
			expect(error instanceof NotFoundError).toBeTruthy();
		}
	});

	test('bad request with no data', async function () {
		try {
			const result = await Job.update(paperGirlId, {});
			throw Error('Test Fail: Job.update');
		} catch (error) {
			expect(error instanceof BadRequestError).toBeTruthy();
		}
	});
});

// /************************************** remove */

describe('remove', function () {
	test('works', async function () {
    await Job.remove(paperGirlId);
    const result = await db.query(`
      SELECT id
        FROM jobs
        WHERE id = $1`,
        [paperGirlId])
        
    expect(result.rows.length).toEqual(0);
  });

	test('not found if no such job', async function () {
		let maxId = await db.query(`
      SELECT MAX(id)
        FROM jobs;
    `);

    maxId = maxId.rows[0].max;
    try {
      await Job.remove(maxId + 1);
      throw new Error('Fail test, line should never run');
    } catch (error) {
      expect(error instanceof NotFoundError).toBeTruthy();
    }
  });
});
