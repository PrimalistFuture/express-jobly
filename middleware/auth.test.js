'use strict';

const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../expressError');
const {
	authenticateJWT,
	ensureLoggedIn,
	ensureAdminUser,
	ensureCurrentOrAdmin,
} = require('./auth');

const { SECRET_KEY } = require('../config');
const testJwt = jwt.sign({ username: 'test', isAdmin: false }, SECRET_KEY);
const badJwt = jwt.sign({ username: 'test', isAdmin: false }, 'wrong');

function next(err) {
	if (err) throw new Error('Got error from middleware');
}

describe('authenticateJWT', function () {
	test('works: via header', function () {
		const req = { headers: { authorization: `Bearer ${testJwt}` } };
		const res = { locals: {} };
		authenticateJWT(req, res, next);
		expect(res.locals).toEqual({
			user: {
				iat: expect.any(Number),
				username: 'test',
				isAdmin: false,
			},
		});
	});

	test('works: no header', function () {
		const req = {};
		const res = { locals: {} };
		authenticateJWT(req, res, next);
		expect(res.locals).toEqual({});
	});

	test('works: invalid token', function () {
		const req = { headers: { authorization: `Bearer ${badJwt}` } };
		const res = { locals: {} };
		authenticateJWT(req, res, next);
		expect(res.locals).toEqual({});
	});
});

describe('ensureLoggedIn', function () {
	test('works', function () {
		const req = {};
		const res = { locals: { user: { username: 'test' } } };
		ensureLoggedIn(req, res, next);
	});
	// NOTE: No expect statement?

	test('unauth if no login', function () {
		const req = {};
		const res = { locals: {} };
		expect(() => ensureLoggedIn(req, res, next)).toThrowError();
	});
});

describe('ensureAdminUser', function () {
	test('works: if user is admin', function () {
		const req = {};
		const res = { locals: { user: { isAdmin: true } } };
		ensureAdminUser(req, res, next);
	});

  // TODO: Adding a negative test for when there is no user

	test('unauth if not admin', function () {
		const req = {};
		const res = { locals: { user: { isAdmin: false } } };
		expect(() => ensureAdminUser(req, res, next)).toThrowError();
	});
});

describe('ensureCurrentOrAdmin', function () {
	test('works if admin', function () {
    const req = { params: { username : 'u1' } };
		const res = { locals: { user: { isAdmin: true } } };
		ensureCurrentOrAdmin(req, res, next);
	});

	test('works if current user but not admin', function () {
    const req = { params: { username : 'u1' } };
		const res = { locals: { user: { username: 'u1', isAdmin: false } } };
		ensureCurrentOrAdmin(req, res, next);
  });

  // TODO: Adding a negative test for when there is no user

	test('unauth if neither current current user nor admin', function () {
    const req = { params: { username : 'u1' } };
		const res = { locals: { user: { username: 'u2', isAdmin: false } } };
    expect(() => ensureCurrentOrAdmin(req, res, next)).toThrowError();
  });
});
