"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
}

/**
 * Middleware to check that users are admins.
 *
 * If not, throw UnauthorizedError
 *
 * TODO: Add check for user in locals before the isAdmin check
 */
function ensureAdminUser(req, res, next) {
  if (res.locals.user.isAdmin === true) {
    return next();
  } else {
    throw new UnauthorizedError();
  }
}

/**
 * Middleware to check if current user or admin.
 *
 * If not, throw UnauthorizedError
 *
 * TODO: Add check for user in locals before the isAdmin and username check
 */
function ensureCurrentOrAdmin(req, res, next) {
  const currentUsername = req.params.username;
  if (res.locals.user.username === currentUsername || res.locals.user.isAdmin === true) {
    return next();
  } else {
    throw new UnauthorizedError();
  }
}


module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdminUser,
  ensureCurrentOrAdmin,
};
