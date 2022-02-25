const express = require("express");
const cookieParser = require('cookie-parser')
const res = require("express/lib/response");
const bcrypt = require('bcryptjs');
const app = express();
app.use(cookieParser())
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

const getIDFromEmail = function (email, obj) {
  for(let key in obj) {
    if (obj[key].email === email) {
      return obj[key].id;
    }
  }
  return null;
};

const urlsForUser = function (userObj, obj) {
  userURLS = {}
  for (let key in obj) {
    if (obj[key].userID === userObj.id) { 
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
  const user = users[req.cookies["user_id"]]
  
  if (!user) {
    console.log("You are not logged in!")
    return res.status(403).send("You need to be logged in to access this area")
  }
  const listOfURLS = urlsForUser(user, urlDatabase)
  const templateVars = { urls: listOfURLS, user: users[req.cookies["user_id"]] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
  if (!templateVars.user) {
    console.log("You are not logged in!")
    return res.status(403).redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString()
  urlDatabase[newShortURL] = {longURL: req.body.longURL, userID:req.cookies["user_id"]};
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
  const user = users[req.cookies["user_id"]]
  
  if (!user) {
    console.log("You are not logged in!")
    return res.status(403).send("You need to be logged in to access this area")
  }
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];

  res.redirect("/urls");
})

app.post("/urls/:id", (req, res) => {
  const user = users[req.cookies["user_id"]]
  
  if (!user) {
    console.log("You are not logged in!")
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
  res.cookie("user_id", loginID);
  res.redirect("/urls");
})

app.post("/logout", (req, res) => {
  const loginID = req.body.user_id;
  res.clearCookie("user_id", loginID)
  res.redirect("/urls")
})

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("register", templateVars);
})

app.post("/register", (req,res) => {
  const randomID = generateRandomString()
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  console.log("hash PW",hashedPassword)

  if (!req.body.email) {
    return res.status(400).send('Bad email 400');
  }
  if (!req.body.password) {
    return res.status(403).send('Bad password 400' );
  } 
  if (emailChecker(email, users)) {
   return res.status(403).send('Email exists: Error 400');
  }

  users[randomID] = {
    id: randomID,
    email: req.body.email,
    password: hashedPassword
  }
  
  res.cookie("user_id", randomID)
  return res.redirect("/urls")
})

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
   res.render("login", templateVars)
})