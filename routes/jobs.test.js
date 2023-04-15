'use strict';

const request = require('supertest');
const { BadRequestError } = require('../expressError');

const db = require('../db');
const app = require('../app');

const {
	commonBeforeAll,
	commonBeforeEach,
	commonAfterEach,
	commonAfterAll,
	u1Token,
	u4Token,
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

/************************************** POST /jobs */

describe('POST /jobs', function () {
	const newJob = {
		title: 'new',
		salary: 100,
		equity: '0.01',
		companyHandle: 'c1',
	};

	test('ok for admin users', async function () {
		const resp = await request(app)
			.post('/jobs')
			.send(newJob)
			.set('authorization', `Bearer ${u4Token}`);
		expect(resp.statusCode).toEqual(201);
		expect(resp.body).toEqual({
			job: newJob,
		});
	});

	test('unauth for non-admin users', async function () {
		const resp = await request(app)
			.post('/jobs')
			.send(newJob)
			.set('authorization', `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	test('bad request with missing data', async function () {
		const resp = await request(app)
			.post('/jobs')
			.send({
				salary: 111,
				equity: '0.01',
			})
			.set('authorization', `Bearer ${u4Token}`);
		expect(resp.statusCode).toEqual(400);
	});

	test('unauth with missing data for non-admin ', async function () {
		const resp = await request(app)
			.post('/jobs')
			.send({
				salary: 111,
				equity: '0.01',
			})
			.set('authorization', `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	test('bad request with invalid data', async function () {
		const resp = await request(app)
			.post('/jobs')
			.send({
        title: 10,
				salary: '1000000',
				companyHandle: 10,
			})
			.set('authorization', `Bearer ${u4Token}`);
		expect(resp.statusCode).toEqual(400);
	});

	test('unauth with invalid data for non-admin', async function () {
		const resp = await request(app)
			.post('/jobs')
			.send({
        title: 10,
				salary: '1000000',
				companyHandle: 10,
			})
			.set('authorization', `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	test('unauthorized for non-admin users', async function () {
		const resp = await request(app)
			.post('/jobs')
			.send(newJob)
			.set('authorization', `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(401);
	});
});

/************************************** GET /jobs */

describe('GET /jobs', function () {
	test('ok for anon', async function () {
		const resp = await request(app).get('/jobs');
		expect(resp.body).toEqual({
			jobs: [
				{
					title: 'Paper Boy',
					salary: 20000,
					equity: '0.005',
					companyHandle: 'c1',
				},
				{
					title: 'Paper Girl',
					salary: 30000,
					equity: '0.1',
					companyHandle: 'c2',
				},
				{
					title: 'Paper Man',
					salary: 10000,
					equity: '0.005',
					companyHandle: 'c3',
				},
				{
					title: 'Paper Woman',
					salary: 10000,
					equity: '0.005',
					companyHandle: 'c1',
				},
			],
		});
	});

	test('returns filtered results with query parameters', async function () {
		const resp = await request(app).get('/jobs?title=Paper+Boy');
		expect(resp.body).toEqual({
			jobs: [
				{
					title: 'Paper Boy',
					salary: 20000,
					equity: '0.005',
					companyHandle: 'c1',
				},
			],
		});
	});

	test('throws BadRequestError given invalid params', async function () {
		const resp = await request(app).get('/jobs?description=Chill');
		expect(resp.statusCode).toEqual(400);
	});

	test('fails: test next() handler', async function () {
		// there's no normal failure event which will cause this route to fail ---
		// thus making it hard to test that the error-handler works with it. This
		// should cause an error, all right :)
		await db.query('DROP TABLE companies CASCADE');
		const resp = await request(app)
			.get('/companies')
			.set('authorization', `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(500);
	});
});

/************************************** GET /jobs/:id */

describe('GET /jobs/:id', function () {
	test('works for anon', async function () {
		const resp = await request(app).get(`/jobs/${paperGirlId}`);
		expect(resp.body).toEqual({
			job: {
          id: paperGirlId,
					title: 'Paper Girl',
					salary: 30000,
					equity: '0.1',
					companyHandle: 'c2',
			},
		});
	});

	test('not found for no such job', async function () {
		const resp = await request(app).get(`/jobs/nope`);
		expect(resp.statusCode).toEqual(404);
	});
});

/************************************** PATCH /jobs/:id */

describe('PATCH /jobs/:id', function () {
	test('works for admin users', async function () {
		const resp = await request(app)
			.patch(`/jobs/${paperGirlId}`)
			.send({
				salary: 25000,
			})
			.set('authorization', `Bearer ${u4Token}`);
		expect(resp.body).toEqual({
			job: {
        id: paperGirlId,
        title: 'Paper Girl',
        salary: 25000,
        equity: '0.1',
        companyHandle: 'c2',
    },
		});
	});

	test('unauth for non-admin', async function () {
		const resp = await request(app)
			.patch(`/jobs/${paperGirlId}`)
			.send({
				salary: 25000,
			})
			.set('authorization', `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	test('unauth for anon', async function () {
		const resp = await request(app)
			.patch(`/jobs/${paperGirlId}`)
			.send({
				salary: 25000,
			});
		expect(resp.statusCode).toEqual(401);
	});

	test('not found on no such company for admin', async function () {
		const resp = await request(app)
			.patch(`/jobs/nope`)
			.send({
				title: 'new nope',
			})
			.set('authorization', `Bearer ${u4Token}`);
		expect(resp.statusCode).toEqual(404);
	});
	test('unauth for no such company non-admin', async function () {
		const resp = await request(app)
			.patch(`/jobs/nope`)
			.send({
				title: 'new nope',
			})
			.set('authorization', `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	// TODO: Add 401 test for non-admin

	test('bad request on handle change attempt', async function () {
		const resp = await request(app)
			.patch(`/job/${paperGirlId}`)
			.send({
				companyHandle: 'c1-new',
			})
			.set('authorization', `Bearer ${u4Token}`);
		expect(resp.statusCode).toEqual(400);
	});

	test('unauth on handle change attempt non-admin', async function () {
		const resp = await request(app)
			.patch(`/job/${paperGirlId}`)
			.send({
				companyHandle: 'c1-new',
			})
			.set('authorization', `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	// TODO: Add 401 test for non-admin

	test('bad request on invalid data', async function () {
		const resp = await request(app)
			.patch(`/jobs/${paperGirlId}`)
			.send({
				salary: '100000',
			})
			.set('authorization', `Bearer ${u4Token}`);
		expect(resp.statusCode).toEqual(400);
	});

	test('unauth on invalid data for non-admin', async function () {
		const resp = await request(app)
			.patch(`/jobs/${paperGirlId}`)
			.send({
				salary: '100000',
			})
			.set('authorization', `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(401);
	});
});

/************************************** DELETE /jobs/:id */

describe('DELETE /jobs/:id', function () {
	test('works for admin users', async function () {
		const resp = await request(app)
			.delete(`/jobs/${paperGirlId}`)
			.set('authorization', `Bearer ${u4Token}`);
		expect(resp.body).toEqual({ deleted: `${paperGirlId}` });
	});

	test('unauth for non-admin', async function () {
		const resp = await request(app)
			.delete(`/jobs/${paperGirlId}`)
			.set('authorization', `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	test('unauth for anon', async function () {
		const resp = await request(app).delete(`/jobs/${paperGirlId}`);
		expect(resp.statusCode).toEqual(401);
	});

	// TODO: Add 401 test for non-admin

	test('not found for no such job', async function () {
		const resp = await request(app)
			.delete(`/jobs/nope`)
			.set('authorization', `Bearer ${u4Token}`);
		expect(resp.statusCode).toEqual(404);
	});

	test('unauth for no such job for non-admin', async function () {
		const resp = await request(app)
			.delete(`/jobs/nope`)
			.set('authorization', `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(401);
	});
});
