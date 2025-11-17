const express = require("express");
const http = require("http");
const methodOverride = require("method-override");
const session = require("express-session");
const { WebSocketServer } = require("ws");
const mongoose = require("mongoose");
const redisClient = require("./redisClient");
const authRoutes = require("./routes/authRoutes");
const urlRoutes = require("./routes/urlRoutes");

const app = express();
const PORT = 3000;

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/url_shortner")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static("public"));
app.use(session({ secret: "mySuperSecretKey123", resave: false, saveUninitialized: true }));

// Routes
app.use("/", authRoutes);
app.use("/", urlRoutes);
//app.use("/api/url", urlRoutes);

// EJS
app.set("view engine", "ejs");

// HTTP + WebSocket server
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Broadcast function
function broadcast(event, data) {
  const message = JSON.stringify({ event, ...data });
  wss.clients.forEach(client => {
    if (client.readyState === 1) client.send(message);
  });
}

// Make broadcast globally accessible
app.locals.broadcast = broadcast;

// Start server
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
