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

// req -----> Middleware --------> route
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };

  res.render("urls_register", templateVars);
});

// To generate a random user ID, use the same function you use to generate random IDs for URLs.
// After adding the user, set a user_id cookie containing the user's newly generated ID.
// Redirect the user to the /urls page.
// Test that the users object is properly being appended to. You can insert a console.log or debugger 
// prior to the redirect logic to inspect what data the object contains.

app.post("/register", (req, res) => {


  //-----------------------------------------
  // console.log('id: ', id);
  // console.log('user =', users[id]);

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

  //   console.log('---end loop');
  // console.log("user object at end of loop", users)
  res.redirect("/urls/"); // 
});

app.get("/urls", (req, res) => {
  const templateVars = {
    //username to user + 
    user: users[req.cookies["user_id"]],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  console.log(req.body);
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  console.log(urlDatabase);
  console.log(req.body); // Log the POST request body to the console
  res.redirect("/urls/" + shortURL); // 
});



app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const templateVars = {
    user: users[req.cookies["user_id"]],
    id, longURL
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const username = req.body["username"];
  console.log(req.body);
  res.cookie('username', username);
  return res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  return res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  //need to update the existing short URL with a long URL
  console.log("test", id, req.body);
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
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








// 1. Lookup the specific user object in the users object using the user_id cookie value
// app.post("/register", (req, res) => {
//   console.log('---Loop through database');
//   for (let id in users) {
//     console.log('id: ', id);
//     console.log('user =', users[id]);
//     // 2. Pass the entire user object to your templates via templateVars.
//     const templateVars = user[id];
//     if (req.body.email === users[id].email)
//       console.log("found matching email");
//     if (req.body.password === users[id].password) {
//       console.log('email and password has matched');
//     }
//   }
//   console.log('---end loop');
//   res.send('Login Successful :) ');
//   // 3. Update the _header partial to show the email property from the user object instead of the username.
// });