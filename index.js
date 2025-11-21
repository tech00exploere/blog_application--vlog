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

//  MongoDB Connection
mongoose
  .connect("mongodb://localhost:27017/blog-app")
  .then(() => console.log(" MongoDB connected"))
  .catch((err) => console.error("❌ DB connection error:", err));

//  View Engine Setup (Use path.join for Windows-safe paths)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//  Middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//  Serve static files from /public (no need to include /public in EJS paths)
app.use(express.static(path.join(__dirname, "public")));

//  Authentication middleware
app.use(checkAuth);

//  Pass logged-in user to all templates
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

//  Routes
app.get("/", (req, res) => {
  res.render("home", { user: req.user });
});

// Redirects
app.get("/signin", (req, res) => res.redirect("/user/signin"));
app.get("/signup", (req, res) => res.redirect("/user/signup"));

// Routers
app.use("/user", userRoute);
app.use("/blog", blogRoute);

// Logout
app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

//  404 Handler (Optional but helpful)
app.use((req, res) => {
  res.status(404).render("404");
});

//  Server Start
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
