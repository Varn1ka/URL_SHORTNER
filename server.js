const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");

const { nanoid } = require("nanoid");

const mongoose = require("mongoose");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const urlRoutes = require("./routes/urlRoutes");
const { auth } = require("./middleware/authMiddleware");
const Url = require("./models/url");
const User = require("./models/user");
// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());


// Set EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// ---------- FRONTEND ROUTES ----------

// Splash page
app.get("/", (req, res) => {
  res.render("splash", { title: "Welcome" });
});

app.get("/signin", (req, res) => {
  res.render("signin", { title: "Sign In" });
});

app.get("/register", (req, res) => {
  res.render("register", { title: "Register" });
});

app.get("/login", (req, res) => {
  res.render('login', { title: 'Login' });

});

// Handle form submission on landing page (example)
app.post("/login", (req, res) => {
  const { email, password } = req.body; // if form sends login info
  res.send(`Login submitted! Email: ${email}`);
});

app.post("/dashboard/shorten", auth, async (req, res) => {
    const { originalUrl } = req.body;

    await Url.create({
        originalUrl,
        shortId: nanoid(7),
        owner: req.user.id
    });

    res.redirect("/dashboard");
});

// Protected Dashboard
app.get("/dashboard", auth, async (req, res) => {
    const urls = await Url.find({ owner: req.user.id });

    res.render("dashboard", {
        user: req.user,
        urls,
        baseUrl: "http://localhost:7000"
    });
});
// ---------- API ROUTES ----------
app.use("/api/auth", authRoutes);
app.use("/api/url", urlRoutes);

// ---------- REDIRECT SHORT URL ----------
app.get("/:shortId", async (req, res) => {
  const shortId = req.params.shortId;
  const url = await Url.findOne({ shortId });

  if (!url) return res.send("URL not found");
  res.redirect(url.originalUrl);
});

// ---------- DATABASE ----------
mongoose.connect("mongodb://127.0.0.1:27017/urlshortener")
  .then(() => console.log("MongoDB Connected!"));

// ---------- START SERVER ----------
app.listen(7000, () => console.log("Server running on port 7000"));

