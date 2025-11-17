const User = require("../models/user");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "mySuperSecretKey123";

module.exports.registerUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.json({ success: false, message: "User already exists" });

    const user = await User.create({ email, password });
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.redirect("/register");
  }
};

module.exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ sub: user._id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
    req.session.token = token;
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.redirect("/login");
  }
};
