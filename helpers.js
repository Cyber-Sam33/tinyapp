
function getUserByEmail(email, database) {
  console.log("email ", email);
  for (let id in database) {
    if (email === database[id].email) {
      console.log("email found ", database[id]);
      return database[id];
    }
  }
  return undefined;
}

module.exports = {
  getUserByEmail
};