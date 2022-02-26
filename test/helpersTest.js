const { assert } = require('chai');

const { getIDFromEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getIDFromEmail', function() {
  it('should return a user with valid email', function() {
    const user = getIDFromEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user, expectedUserID, "The values are equal");
  });

  it('should return undefined when email does not exist in database', function() {
    const user = getIDFromEmail("email@doesnotexist.com", testUsers);
    const expectedResult = undefined;
    assert.equal(user, expectedResult, "The values are not equal");
  });
});