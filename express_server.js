function generateRandomString() {
  let randomStr = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    randomStr += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomStr;
}

function getUserByEmail(email) {
  for (let id in users) {
    if (email === users[id].email) {
      return users[id];
    }
  }
  return null;
}


const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
app.set("view engine", "ejs");
const PORT = 8080; // default port 8080

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

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
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//created user const variable and replaced logic in /register at end of GET
app.get("/register", (req, res) => {
  const user = users[req.cookies["user_id"]];
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
  } else if (getUserByEmail(req.body.email)) {
    res.status(400).send('Email already exists.');
  } else {
    const id = generateRandomString();
    const email = req.body.email;
    const password = req.body.password;
    const user = {
      id: id,
      email: email,
      password: password
    };
    users[id] = user;
    res.cookie('user_id', id);
  }
  res.redirect("/urls/");
});


function urlsForUser(id) {
  //make an empty object 
  let userObj = {};
  //loop through database
  for (url in urlDatabase) {
    //test the database userid(key) against the userID(function parameter)
    if (id === urlDatabase[url].userID) {
      userObj[url] = urlDatabase[url];
      //if found, assign to empty object
    }
  }
  //return out of FOR loop
  return userObj;
}

// urls[id].longurl
app.get("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (!user) {
    return res.send("Error, user not found");
  }

  const urlUser = urlsForUser(req.cookies["user_id"]);

  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlUser
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (!user) {
    return res.redirect("/login");
  }
  const templateVars = {
    user: user,
  };
  res.render("urls_new", templateVars);
});


app.post("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (!user) {
    return res.send("<p>Only for logged-in users</p>");
  }

  const shortURL = generateRandomString();

  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.cookies["user_id"] };
  console.log(urlDatabase);
  console.log("long URL", req.body.longURL); // Log the POST request body to the console
  res.redirect("/urls/" + shortURL); // 
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  //changed to .longURL
  const longURL = urlDatabase[id].longURL;
  if (!longURL) {
    return res.send("<p>id does not exist</p>");
  }
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (!user) {
    return res.send("Error, user not found");
  }

  if (req.cookies["user_id"] !== urlDatabase[req.params.id].userID) {
    return res.send("Error, not your URL");
  }

  const id = req.params.id;
  //changed to .LongURL
  const longURL = urlDatabase[id].longURL;
  const templateVars = {
    user: users[req.cookies["user_id"]],
    id, longURL
  };
  res.render("urls_show", templateVars);
});

//create a get login with endpoint new login form template
app.get("/login", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (user) {
    return res.redirect("/urls");
  }
  const templateVars = { user };
  res.render("urls_loginForm", templateVars);
});

app.post("/login", (req, res) => {

  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email);
  if (!user) {
    return res.status(403).send("Email not found");
  }

  if (user.password !== password) {
    return res.status(403).send("Passwords do not match");
  }

  res.cookie('user_id', user.id);
  return res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  return res.redirect("/login");
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const user = users[req.cookies["user_id"]];
  if (!user) {
    return res.send("Error, user not found");
  }

  if (!urlDatabase[id]) {
    return res.send("The short URL doesn't exist");
  }

  if (req.cookies["user_id"] !== urlDatabase[req.params.id].userID) {
    return res.send("Error, not your URL");
  }


  urlDatabase[id].longURL = req.body.longURL;

  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;

  const user = users[req.cookies["user_id"]];
  if (!user) {
    return res.send("Error, user not found");
  }

  if (!urlDatabase[id]) {
    return res.send("The short URL doesn't exist");
  }

  if (req.cookies["user_id"] !== urlDatabase[req.params.id].userID) {
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
