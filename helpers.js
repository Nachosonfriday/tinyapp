const getIDFromEmail = function(email, obj) {
  for (let key in obj) {
    if (obj[key].email === email) {
      return obj[key].id;
    }
  }
  return null;
};

module.exports = { getIDFromEmail };