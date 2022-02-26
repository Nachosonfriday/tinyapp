const express = require("express");
const cookieParser = require('cookie-parser')
var cookieSession = require('cookie-session')
const res = require("express/lib/response");
const bcrypt = require('bcryptjs');
const app = express();

const { getIDFromEmail } = require('./helpers');
// app.use(cookieParser())
app.use(cookieSession({
  name: 'session',
  keys: ['my', 'secret', 'keys'],
}))

const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
const e = require("express");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

function generateRandomString() {
  return Math.random().toString(36).slice(2, 8); 
};

let users = {
  "userRandomID": {
    id: "userRandomID", 
    email: "a@a.com", 
    password: "a"
  }
}

const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "userRandomID"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "grgd334"
  }
};

const emailChecker = (email, usersDB) => {
  for (let user in usersDB) {
    console.log(usersDB[email], email)
    if (usersDB[user].email === email) {
      return true 
    }
  }
  return false 
}


const urlsForUser = function (userId, obj) {
  userURLS = {}
  for (let key in obj) {
    if (obj[key].userID === userId) { 
      userURLS[key] = obj[key]
    }
  }
  return userURLS  
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const user = req.session.user_id
  
  if (!user) {
    return res.status(403).send("You need to be logged in to access this area")
  }
  const listOfURLS = urlsForUser(user, urlDatabase)
  const templateVars = { urls: listOfURLS, "user": req.session.user_id, users: users };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, "user": req.session.user_id, users: users };
  if (!templateVars.user) {
    return res.status(403).redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, "user": req.session.user_id, users: users };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString()
  urlDatabase[newShortURL] = {longURL: req.body.longURL, userID:req.session["user_id"]};
  res.redirect(`/urls/${newShortURL}`);   
});

app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params['shortURL']]) {
    return res.status(404).send("Short URL is not in database")
  }
  const longURL = urlDatabase[req.params['shortURL']].longURL
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const user = req.session.user_id
  
  if (!user) {
    console.log("You are not logged in!")
    return res.status(403).send("You need to be logged in to access this area")
  }

  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    return res.status(403).send("You need to be logged in to access this area")
  }
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];

  res.redirect("/urls");
})

app.post("/urls/:id", (req, res) => {
  const user = req.session.user_id

  if (!user) {
    console.log("You are not logged in!")
    return res.status(403).send("You need to be logged in to access this area")
  }

  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    return res.status(403).send("You need to be logged in to access this area")
  }

  const shortURL = req.params.id
  const newLongURL = req.body.name
  urlDatabase[shortURL].longURL =  newLongURL
  
  res.redirect("/urls")
})

app.post("/login", (req, res) => {
  const email = req.body.email
  const password = req.body.password
  
  let loginID = getIDFromEmail(email, users)
  if (!loginID) {
     return res.status(403).send("Error 403: Email doesn't exist");
  }
  if (!bcrypt.compareSync(password, users[loginID].password)){
  // if (users[loginID].password !== password){
    return res.status(403).send("Error 403: Password doesn't match");
  }
 
  req.session.user_id = loginID;
  res.redirect("/urls");
})

app.post("/logout", (req, res) => {
  const loginID = req.body.user_id;
  // res.clearCookie("user_id", loginID)
  req.session = null;
  res.redirect("/urls")
})

app.get("/register", (req, res) => {
  const templateVars = { "user": req.session.user_id, users: users };
  res.render("register", templateVars);
})

app.post("/register", (req,res) => {
  const randomId = generateRandomString()
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  

  if (!req.body.email) {
    return res.status(400).send('Please enter email 400');
  }
  if (!req.body.password) {
    return res.status(403).send('Please enter password 400' );
  } 
  if (emailChecker(email, users)) {
   return res.status(403).send('Email exists: Error 400');
  }

   users[randomId] = { 
    id: randomId,
    email: req.body.email,
    password: hashedPassword
  }
  


  // res.cookie("user_id", randomID)
  req.session.user_id = randomId;
  return res.redirect("/urls")
})

app.get("/login", (req, res) => {
  const templateVars = { "user": req.session.user_id, users: users };
   res.render("login", templateVars)
})