const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const app = express();
const bodyParser = require("body-parser");
const PORT = 8080; // default port 8080
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const { getIDFromEmail, urlsForUser, emailChecker } = require('./helpers');
app.use(cookieSession({
  name: 'session',
  keys: ['my', 'secret', 'keys'],
}));

// generates the ID for each user when they register
function generateRandomString() {
  return Math.random().toString(36).slice(2, 8);
}

let users = {
  "userRandomID": {
    id: "userRandomID",
    email: "a@a.com",
    password: "a"
  }
};

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

// Get request pages

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/register", (req, res) => {
  const templateVars = { "user": req.session.user_id, users: users };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { "user": req.session.user_id, users: users };
  res.render("login", templateVars);
});

app.get("/urls", (req, res) => {
  const user = req.session.user_id;
  
  if (!user) {
    return res.status(403).send("You need to be logged in to access this area");
  }

  //list of URLS grabs the specific urls for that specific user
  const listOfURLS = urlsForUser(user, urlDatabase);
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

app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params['shortURL']]) {
    return res.status(404).send("Short URL is not in database");
  }
  const longURL = urlDatabase[req.params['shortURL']].longURL;
  res.redirect(longURL);
});

// Post reqest pages

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  let loginID = getIDFromEmail(email, users);
  if (!loginID) {
    return res.status(403).send("Error 403: Email doesn't exist");
  }
  if (!bcrypt.compareSync(password, users[loginID].password)) {
    return res.status(403).send("Error 403: Password doesn't match");
  }
 
  req.session.user_id = loginID;
  res.redirect("/urls");
});

app.post("/register", (req,res) => {
  const randomId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!req.body.email) {
    return res.status(400).send('Please enter email 400');
  }
  if (!req.body.password) {
    return res.status(403).send('Please enter password 400');
  }
  if (emailChecker(email, users)) {
    return res.status(403).send('Email exists: Error 400');
  }

//adds to users database
  users[randomId] = {
    id: randomId,
    email: req.body.email,
    password: hashedPassword
  };
  
  req.session.user_id = randomId;
  return res.redirect("/urls");
});

//creates a random ID for the short URL 
app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString();
  urlDatabase[newShortURL] = {longURL: req.body.longURL, userID:req.session["user_id"]};
  res.redirect(`/urls/${newShortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const user = req.session.user_id;
  
  if (!user) {
    console.log("You are not logged in!");
    return res.status(403).send("You need to be logged in to access this area");
  }
  
  if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    return res.status(403).send("You need to be logged in to access this area");
  }
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];

  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const user = req.session.user_id;

  if (!user) {
    console.log("You are not logged in!");
    return res.status(403).send("You need to be logged in to access this area");
  }

  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    return res.status(403).send("You need to be logged in to access this area");
  }

  //reassigns website to short url
  const shortURL = req.params.id;
  const newLongURL = req.body.name;
  urlDatabase[shortURL].longURL =  newLongURL;
  
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});