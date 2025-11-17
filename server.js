require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const cookieParser = require("cookie-parser");
const path = require("path");
const http = require("http");

const authRoutes = require("./routes/authRoutes");
const urlRoutes = require("./routes/urlRoutes");
const { initWebSocket } = require("./ws");
const { redis } = require("./redis");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();
const server = http.createServer(app);

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// WebSocket
initWebSocket(server);

// Routes
app.get("/", (req, res) => res.render("splash"));
app.get("/login", (req, res) => res.render("signin"));
app.get("/signin", (req, res) => res.render("signin"));
app.get("/register", (req, res) => res.render("register"));

app.use("/api/auth", authRoutes);
app.use("/api/url", urlRoutes);

// Short URL Redirect
const Url = require("./models/url");
app.get("/:shortId", async (req, res) => {
  const { shortId } = req.params;
  try {
    const cached = await redis.get(shortId);
    if (cached) return res.redirect(cached);

    const url = await Url.findOne({ shortId });
    if (!url) return res.status(404).send("URL Not Found");

    await redis.set(shortId, url.originalUrl);
    return res.redirect(url.originalUrl);
  } catch (err) {
    console.error("❌ Redirect Error:", err);
    res.status(500).send("Server Error");
  }
});

// Dashboard
app.get("/dashboard", authMiddleware.auth, async (req, res) => {
  try {
    const urls = await Url.find({ owner: req.user.sub });
    res.render("dashboard", {
      user: req.user,
      urls,
      baseUrl: `http://localhost:${process.env.PORT || 3000}`,
    });
  } catch (err) {
    console.error(err);
    res.render("dashboard", { user: req.user, urls: [], baseUrl: "" });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
