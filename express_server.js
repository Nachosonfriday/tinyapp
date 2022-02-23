const express = require("express");
const cookieParser = require('cookie-parser')
const res = require("express/lib/response");
const app = express();
app.use(cookieParser())
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

function generateRandomString() {
  return Math.random().toString(36).slice(2, 8); 
};

let users = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  }
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
  const templateVars = { urls: urlDatabase, username: req.cookies["username"], };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"], };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  // console.log("req params", req.params.shortURL)
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"], };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString()
  urlDatabase[newShortURL] = req.body.longURL;
  res.redirect(`/urls/${newShortURL}`);   
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params['shortURL']];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];

  res.redirect("/urls");
})

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id
  const newLongURL = req.body.name
  urlDatabase[shortURL] =  newLongURL
  
  res.redirect("/urls")
})

app.post("/login", (req, res) => {
  const loginID = req.body.username;
  res.cookie("username", loginID);
  res.redirect("/urls");
})

app.post("/logout", (req, res) => {
  const loginID = req.body.username;
  res.clearCookie("username", loginID)
  res.redirect("/urls")
})

app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"], };
  res.render("register", templateVars);
})

app.post("/register", (req,res) => {
  const randomID = generateRandomString()
  users[randomID] = {
    id: [randomID],
    email: req.body.email,
    password: req.body.password
  }
  res.cookie("user_id", randomID)
  return res.redirect("/urls")
})