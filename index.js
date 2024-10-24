//library imports
const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { User, Task } = require("./db");

//initialization and config
const app = express();
app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

mongoose.connect(
  "mongodb+srv://workwithdevninja:rwIReI2oS6RIJCOD@learnnode.xecla.mongodb.net/todobook"
);

//constants
const PORT = process.env.PORT || 3000;
const HOST = "http://localhost";
const JWT_SECRET = "1427SECRET@#@JWT1427";

//middlewares

const isEmailAlreadyRegistered = async (req, res, next) => {
  let user = await User.findOne({
    emailId: req.body.emailId,
  });

  if (user) {
    res.status(403).json({
      msg: "email id is already registered !",
    });
  } else {
    next();
  }
};

const checkUserCredentials = async (req, res, next) => {
  let user = await User.findOne({
    emailId: req.body.emailId,
    password: req.body.password,
  });

  if (user) {
    req._token = jwt.sign({ userId: user._id }, JWT_SECRET);
    next();
  } else {
    res.status(403).json({
      msg: "incorrect credentials !",
    });
  }
};

const checkAuth = async (req, res, next) => {
  if (req.body._token === "") {
    res.status(403).json({ msg: "user not logged in" });
    return;
  }

  const tokenData = jwt.verify(req.body._token, JWT_SECRET);

  let user = await User.findOne({
    _id: tokenData.userId,
  });

  let tasks = await Task.find({
    userId: tokenData.userId,
  });

  if (user) {
    req.fullName = user.fullName;
    req.tasks = tasks;
    req.userId = user._id;
    next();
  } else {
    res.status(403).json({ msg: "something is wrong" });
  }
};

//backend apis

app.post("/api/checkUserAuth", checkAuth, (req, res) => {
  res.status(200).json({
    fullName: req.fullName,
    tasks: req.tasks,
  });
});

app.post("/api/addTask", checkAuth, async (req, res) => {
  await Task.create({
    userId: req.userId,
    title: req.body.title,
    isCompleted: false,
  });
  res.status(200).json({
    tasks: req.tasks,
  });
});

app.post("/api/removeTask", checkAuth, async (req, res) => {
  await Task.findOneAndDelete({
    userId: req.userId,
    _id: req.body._id,
  });

  res.status(200).json({
    tasks: req.tasks,
  });
});

app.post("/api/updateTask", checkAuth, async (req, res) => {
  await Task.findOneAndUpdate(
    {
      userId: req.userId,
      _id: req.body._id,
    },
    { isCompleted: req.body.status }
  );

  res.status(200).json({
    tasks: req.tasks,
  });
});

app.post("/api/signup", isEmailAlreadyRegistered, async (req, res) => {
  try {
    let newUser = await User.create({
      fullName: req.body.fullName,
      emailId: req.body.emailId,
      password: req.body.password,
    });

    if (newUser)
      res.status(200).json({
        msg: "Account Created",
      });
  } catch (error) {
    res.status(403).json({
      msg: "please check all the details !",
    });
  }
});

app.post("/api/login", checkUserCredentials, async (req, res) => {
  res.status(200).json({
    _token: req._token,
    msg: "Logged In !",
  });
});

//frontend pages
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/login.html");
});

app.get("/signup", (req, res) => {
  res.sendFile(__dirname + "/public/signup.html");
});

app.get("/todolist", (req, res) => {
  res.sendFile(__dirname + "/public/todolist.html");
});
//server
app.listen(PORT, () => {
  console.log("server is running at " + HOST + ":" + PORT);
});
