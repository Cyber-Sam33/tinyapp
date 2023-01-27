const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    // Write your assert statement here
    assert.ok(user);
    assert.equal(user.email, 'user@example.com');
  });

  it('should return undefined for invalid email', function() {
    const user = getUserByEmail("user@example333.com", testUsers);
    // Write your assert statement here
    console.log(user);
    assert.ok(user === undefined);
  });
});