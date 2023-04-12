const jwt = require("jsonwebtoken");
const { createToken } = require("./tokens");
const { SECRET_KEY } = require("../config");
const { sqlForPartialUpdate } = require("./sql");
const { BadRequestError } = require("../expressError");


// beforeAll(function() {

// });

// {
//   firstName: "first_name",
//   lastName: "last_name",
//   isAdmin: "is_admin",
// }

const data = {
  handle: "acme",
  name: "The Royal Acme Corporation"
}

const jsToSql = {
  numEmployees: "num_employees",
  logoUrl: "logo_url",
}

describe("sqlForPartialUpdate", function () {
  test("returns an object", function () {
    const result = sqlForPartialUpdate(data, jsToSql);
    expect(typeof result).toBe('object')
  })

  test("setCols is a string of paramaterized values", function () {
    const {setCols, values} = sqlForPartialUpdate(data, jsToSql);
    expect(typeof setCols).toBe('string');
    expect(setCols).toEqual('"handle"=$1, "name"=$2');
  });

  test("values is an array of strings", function () {
    const {setCols, values} = sqlForPartialUpdate(data, jsToSql);
    expect(Array.isArray(values)).toBe(true);
    expect(values).toEqual(["acme", "The Royal Acme Corporation"]);
  });

  test("throws bad request error if dataToUpdate is empty", function () {
    try {
      const result = sqlForPartialUpdate({}, jsToSql);
      throw new Error('Fail Test');
    } catch (error) {
      expect(error instanceof BadRequestError).toBeTruthy();
    }

  });

})

// describe("createToken", function () {
//   test("works: not admin", function () {
//     const token = createToken({ username: "test", is_admin: false });
//     const payload = jwt.verify(token, SECRET_KEY);
//     expect(payload).toEqual({
//       iat: expect.any(Number),
//       username: "test",
//       isAdmin: false,
//     });
//   });

//   test("works: admin", function () {
//     const token = createToken({ username: "test", isAdmin: true });
//     const payload = jwt.verify(token, SECRET_KEY);
//     expect(payload).toEqual({
//       iat: expect.any(Number),
//       username: "test",
//       isAdmin: true,
//     });
//   });

//   test("works: default no admin", function () {
//     // given the security risk if this didn't work, checking this specifically
//     const token = createToken({ username: "test" });
//     const payload = jwt.verify(token, SECRET_KEY);
//     expect(payload).toEqual({
//       iat: expect.any(Number),
//       username: "test",
//       isAdmin: false,
//     });
//   });
// });
