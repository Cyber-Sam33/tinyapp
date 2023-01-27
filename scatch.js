function getUserByEmail(email, database) {
  console.log("email ", email);
  for (let id in database) {
    if (email === users[id].email) {
      console.log("email found ", users[id]);
      return users[id];
    }
  }
  return null;
}



//REMOVED
function getUserByEmail(email) {
  console.log("email ", email);
  for (let id in users) {
    if (email === users[id].email) {
      console.log("email found ", users[id]);
      return users[id];
    }
  }
  return null;
}