'use strict';

const db = require('../db.js');
const { BadRequestError, NotFoundError } = require('../expressError');
const Job = require('./company.js');
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
    expect(result.rows[0].toEqual(
      {
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
        company_handle: 'c1'
      },
      {
        title: 'Paper Girl',
        salary: 30000,
        equity: 0.1,
        company_handle: 'c2'
      },
      {
        title: 'Paper Man',
        salary: 10000,
        equity: 0.005,
        company_handle: 'c3'
      },
      {
        title: 'Paper Woman',
        salary: 10000,
        equity: 0.005,
        company_handle: 'c1'
      },
    ])
  });
});


/********************************** findWhere */
describe('findWhere', function () {
  test('works: returns array of jobs', async function () {
    const jobs = await Job.findWhere({ title: 'Paper Boy'});
    expect(jobs).toEqual([
      {
        title: 'Paper Boy',
        salary: 20000,
        equity: 0.005,
        company_handle: 'c1'
      },
    ])
  });
  test('throws NotFoundError if no results meet criteria', async function () {
    try {
      const jobs = await Job.findWhere({ title: 'Paper Being'});
      throw Error('Fail Test: Job.findWhere');
    } catch (error) {
      expect(error instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** Job.sqlClauseForFindWhere */
describe('sqlClauseForFindWhere', function () {
  test('works: for one query parameter', function () {

    test('works: for multiple query parameters', function () {

      test('throws bad request error if dataToSearch is empty', function () {
      });
    });
  });
});

/************************************** get */

describe('get', function () {
  test('works', async function () {

  });

  test('not found if no such job', async function () {

  });
});


/************************************** update */

describe('update', function () {
  // const updateData = {
  // 	name: 'New',
  // 	description: 'New Description',
  // 	numEmployees: 10,
  // 	logoUrl: 'http://new.img',
  // };

  test('works', async function () {

  });


		);

test('works: null fields', async function () {
  const updateDataSetNulls = {
    name: 'New',
    description: 'New Description',
    numEmployees: null,
    logoUrl: null,
  };
});

test('bad request for trying to change company_handle');

test('bad request for trying to change id');

test('not found if no such job', async function () {


  test('bad request with no data', async function () {

  });

  /************************************** remove */

  describe('remove', function () {
    test('works', async function () {

    });

    test('not found if no such job', async function () {

    });
  });