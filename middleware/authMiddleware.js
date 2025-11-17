const jwt = require("jsonwebtoken");
const JWT_SECRET = "mySuperSecretKey123";

module.exports = (req, res, next) => {
  const token = req.session.token;
  if (!token) return res.redirect("/login");

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error(err);
    res.redirect("/login");
  }
};
