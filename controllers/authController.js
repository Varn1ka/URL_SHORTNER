const User = require("../models/user")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const JWT_SECRET = "mySuperSecretKey123"  // hardcoded secret for CE1

module.exports.registerUser = async (req, res) => {
  let email = req.body.email
  let password = req.body.password

  let existing = await User.findOne({ email })
  if (existing) return res.json({ success: false, message: "User already exists" })

  let hash = await bcrypt.hash(password, 10)
  let user = new User({ email: email, password: hash })
  await user.save()

  res.json({
    success: true,
    message: "User registered successfully",
    data: user
  })
}

module.exports.loginUser = async (req, res) => {
  let email = req.body.email
  let password = req.body.password

  let user = await User.findOne({ email })
  if (!user) return res.json({ success: false, message: "Invalid credentials" })

  let valid = await bcrypt.compare(password, user.password)
  if (!valid) return res.json({ success: false, message: "Invalid credentials" })

  // generate token using hardcoded secret
  let token = jwt.sign({ sub: user._id }, JWT_SECRET)
  res.json({
    success: true,
    message: "Login successful",
    token: token
  })
}
