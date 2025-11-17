const User = require("../models/user");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

module.exports.registerUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.render("register", { title: "Register", error: "User already exists" });

    const user = await User.create({ email, password });

    const token = jwt.sign({ sub: user._id, email: user.email }, JWT_SECRET, { expiresIn: "1d" });
    res.cookie("token", token, { httpOnly: true, sameSite: "lax", maxAge: 24 * 60 * 60 * 1000 });

    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.render("register", { title: "Register", error: "Something went wrong" });
  }
};

module.exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password) return res.render("signin", { title: "Login", error: "Invalid credentials" });

    const token = jwt.sign({ sub: user._id, email: user.email }, JWT_SECRET, { expiresIn: "1d" });
    res.cookie("token", token, { httpOnly: true, sameSite: "lax" });

    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.render("signin", { title: "Login", error: "Something went wrong" });
  }
};
