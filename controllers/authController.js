const User = require("../models/user");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "mySuperSecretKey123";

module.exports.registerUser = async (req, res) => {
  const { email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.render("register", {
      title: "Register",
      error: "User already exists",
    });
  }

  const user = new User({ email, password });
  await user.save();

  // FIX: always use sub
  const token = jwt.sign(
    { sub: user._id, email: user.email },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.redirect("/dashboard");
};

module.exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user || user.password !== password) {
    return res.render("login", {
      title: "Login",
      error: "Invalid credentials",
    });
  }

  const token = jwt.sign(
    { sub: user._id, email: user.email },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
  });

  res.redirect("/dashboard");
};
