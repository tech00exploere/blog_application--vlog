const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const checkAuth = require("./middleware/checkAuth");
const blogRoute = require("./router/blog");
const userRoute = require("./router/user");

const app = express();
const port = 4578;

mongoose
  .connect("mongodb://localhost:27017/blog-app")
  .then(() => console.log(" MongoDB connected"))
  .catch((err) => console.error("❌ DB connection error:", err));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//  Middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));

app.use(checkAuth);

app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

app.get("/", (req, res) => {
  res.render("home", { user: req.user });
});

app.get("/signin", (req, res) => res.redirect("/user/signin"));
app.get("/signup", (req, res) => res.redirect("/user/signup"));

app.use("/user", userRoute);
app.use("/blog", blogRoute);

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

app.use((req, res) => {
  res.status(404).render("404");
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
