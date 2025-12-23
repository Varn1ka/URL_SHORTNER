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

mongoose.connect(process.env.MONGO_URL || "mongodb://127.0.0.1:27017/url_shortner")
//mongoose.connect("mongodb://127.0.0.1:27017/url_shortner")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static("public"));
app.use(session({ secret: "mySuperSecretKey123", resave: false, saveUninitialized: true }));

app.use("/", authRoutes);
app.use("/", urlRoutes);


app.set("view engine", "ejs");

const server = http.createServer(app);
const wss = new WebSocketServer({ server });


function broadcast(event, data) {
  const message = JSON.stringify({ event, ...data });
  wss.clients.forEach(client => {
    if (client.readyState === 1) client.send(message);
  });
}

app.locals.broadcast = broadcast;

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));


//docker compose- manages multiple containers 
//FROM- base image
//COPY source dest
// docker build -t g27-backend .
//docker run -p 4242:3345 g27-backend
//docker kill id
//docker rm id
//docker compose up
//docker compose up -d
//docker compose down
//docker login
//docker tag g27-backend varn1ka/repo1:v5
//docker push varn1ka/repo1:v5