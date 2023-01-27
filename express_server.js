const { getUserByEmail } = require('./helpers.js');

const bcrypt = require("bcryptjs");
const express = require("express");
const cookieSession = require('cookie-session'); // replaced cookie parser
const app = express();
app.set("view engine", "ejs");
const PORT = 8080;

app.use(cookieSession({
  name: 'session',
  keys: ['test'],
  maxAge: 24 * 60 * 60 * 1000
}));
app.use(express.urlencoded({ extended: true }));


//----------------- functions ------------------------//

function generateRandomString() {
  let randomStr = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    randomStr += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomStr;
}


function urlsForUser(id) {
  let userObj = {};
  for (url in urlDatabase) {
    if (id === urlDatabase[url].userID) {
      userObj[url] = urlDatabase[url];
    }
  }
  return userObj;
}



//--------------------------------DATA--------------------------------

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  },
};


//-------------------------------GET/POSTS--------------------------------

//created user const variable and replaced logic in /register at end of GET
app.get("/register", (req, res) => {
  const user = users[req.session["user_id"]];
  if (user) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: user,
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {

  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("You need to enter a valid email or password");
  } else if (getUserByEmail(req.body.email, users)) {
    res.status(400).send('Email already exists.');
  } else {

    const id = generateRandomString();
    // console.log("Request response, ", res.cookie('user_id', id));
    const email = req.body.email;
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);

    const user = {
      id: id,
      email: email,
      password: hashedPassword
    };
    users[id] = user;

    req.session.user_id = id;
  }
  res.redirect("/urls/");
});

app.get("/urls", (req, res) => {
  console.log(" line 117 user ID: ", req.session["user_id"]);
  const user = users[req.session["user_id"]];
  if (!user) {
    res.redirect("/login");
  }

  const urlUser = urlsForUser(req.session["user_id"]);

  const templateVars = {
    user: users[req.session["user_id"]],
    urls: urlUser
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.session["user_id"]];
  if (!user) {
    return res.redirect("/login");
  }
  const templateVars = {
    user: user,
  };
  res.render("urls_new", templateVars);
});


app.post("/urls", (req, res) => {
  const user = users[req.session["user_id"]];
  if (!user) {
    return res.send("<p>Only for logged-in users</p>");
  }

  const shortURL = generateRandomString();

  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session["user_id"] }; //*
  // console.log(urlDatabase);
  console.log("long URL", req.body.longURL); // Log the POST request body to the console
  res.redirect("/urls/" + shortURL);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;

  const longURL = urlDatabase[id].longURL;
  if (!longURL) {
    return res.send("<p>id does not exist</p>");
  }
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  const user = users[req.session["user_id"]];
  if (!user) {
    return res.send("Error, user not found");
  }

  if (req.session["user_id"] !== urlDatabase[req.params.id].userID) {
    return res.send("Error, not your URL");
  }

  const id = req.params.id;

  const longURL = urlDatabase[id].longURL;
  const templateVars = {
    user: users[req.session["user_id"]],
    id, longURL
  };
  res.render("urls_show", templateVars);
});

//create a get login with endpoint new login form template
app.get("/login", (req, res) => {
  const user = users[req.session["user_id"]]; // *
  if (user) {
    return res.redirect("/urls");
  }
  const templateVars = { user };
  res.render("urls_loginForm", templateVars);
});

app.post("/login", (req, res) => {

  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  if (!user) {
    return res.status(403).send("Email not found");
  }

  console.log("Password ", user.password, password);
  console.log(bcrypt.hashSync(password, 10));

  //hashed passwords compared against original
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Passwords do not match");
  }

  req.session.user_id = user.id;
  return res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  return res.redirect("/login");
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const user = users[req.session["user_id"]];
  if (!user) {
    return res.send("Error, user not found");
  }

  if (!urlDatabase[id]) {
    return res.send("The short URL doesn't exist");
  }

  if (req.session["user_id"] !== urlDatabase[req.params.id].userID) {
    return res.send("Error, not your URL");
  }

  urlDatabase[id].longURL = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;

  const user = users[req.session["user_id"]];
  if (!user) {
    return res.send("Error, user not found");
  }

  if (!urlDatabase[id]) {
    return res.send("The short URL doesn't exist");
  }

  if (req.session["user_id"] !== urlDatabase[req.params.id].userID) {
    return res.send("Error, not your URL");
  }

  delete urlDatabase[id];
  res.redirect("/urls");
});

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

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});
