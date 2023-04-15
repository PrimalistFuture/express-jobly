"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdminUser } = require("../middleware/auth");
const Job = require("../models/jobs");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
const jobSearchSchema = require("../schemas/jobSearch.json");

const router = new express.Router();


/** POST / { job } =>  { job }
 *
 * job should be { title, salary, equity, companyHandle }
 *
 * Returns { job: { id, title, salary, equity, companyHandle } }
 *
 * Authorization required: login, isAdmin
 */
 // TODO: Can remove ensureLoggedIn once we update ensureAdminUser
router.post("/", ensureLoggedIn, ensureAdminUser, async function (req, res, next) {
  // const validator = jsonschema.validate(
  //   req.body,
  //   jobNewSchema,
  //   {required: true}
  // );
  // if (!validator.valid) {
  //   const errs = validator.errors.map(e => e.stack);
  //   throw new BadRequestError(errs);
  // }

  // const company = await Company.create(req.body);
  // return res.status(201).json({ company });
});

/** GET /  =>
 *   { job: [ { title, salary, equity, companyHandle }, ...] }
 *
 * Can filter on provided search filters:
 * - title (will find case-insensitive, partial matches)
 * - salary
 * - hasEquity
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  // if (Object.keys(req.query).length > 0) {
  //   const validator = jsonschema.validate(
  //     req.query,
  //     companySearchSchema,
  //     {required:true}
  //   );

  //   console.log(validator.valid);
  //   if (validator.valid === false) {
  //     console.log('I am the invalid validator', validator.errors)
  //     const errs = validator.errors.map(e => e.stack);
  //     console.log(errs, 'Getting ready to be thrown!')
  //     throw new BadRequestError(errs);

  //   } else {
  //     console.log(req.query, 'req.query from the else block')
  //     const companies = await Company.findWhere(req.query);
  //     return res.json({ companies });
  //   }
  // }

  // const companies = await Company.findAll();
  // return res.json({ companies });
});


/** GET /[id]  =>  { job }
 *
 *  job is { title, salary, equity, companyHandle }
 *
 *
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
  // const company = await Company.get(req.params.handle);
  // return res.json({ company });
});

/** PATCH /[id] { fld1, fld2, ... } => { job }
 *
 * Patches job data.
 *
 * fields can be: { title, salary, equity }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required: login, isAdmin
 */

router.patch("/:id", ensureLoggedIn, ensureAdminUser, async function (req, res, next) {
  // const validator = jsonschema.validate(
  //   req.body,
  //   companyUpdateSchema,
  //   {required:true}
  // );
  // if (!validator.valid) {
  //   const errs = validator.errors.map(e => e.stack);
  //   throw new BadRequestError(errs);
  // }

  // const company = await Company.update(req.params.handle, req.body);
  // return res.json({ company });
});

/** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization: login, isAdmin
 */

router.delete("/:id", ensureLoggedIn, ensureAdminUser, async function (req, res, next) {
  // await Company.remove(req.params.handle);
  // return res.json({ deleted: req.params.handle });
});


module.exports = router;
