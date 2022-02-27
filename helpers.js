const getIDFromEmail = function(email, obj) {
  for (let key in obj) {
    if (obj[key].email === email) {
      return obj[key].id;
    }
  }
  return null;
};

const urlsForUser = function(userId, obj) {
  let userURLS = {};
  for (let key in obj) {
    if (obj[key].userID === userId) {
      userURLS[key] = obj[key];
    }
  }
  return userURLS;
};

const emailChecker = (email, usersDB) => {
  for (let user in usersDB) {
    if (usersDB[user].email === email) {
      return true;
    }
  }
  return false;
};

module.exports = { getIDFromEmail, urlsForUser, emailChecker };