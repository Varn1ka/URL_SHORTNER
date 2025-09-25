const User = require("../models/user")
const jwt = require("jsonwebtoken")

const JWT_SECRET = "mySuperSecretKey123"  

module.exports.registerUser = async (req, res) => {
  const { email, password } = req.body

  const existing = await User.findOne({ email })
  if (existing) return res.json({ success: false, message: "User already exists" })

  const user = new User({ email, password }) 
  await user.save()

  res.json({
    success: true,
    message: "User registered successfully",
    data: user
  })
}


module.exports.loginUser = async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email })
  if (!user || user.password !== password)
    return res.json({ success: false, message: "Invalid credentials" })

  const token = jwt.sign({ sub: user._id }, JWT_SECRET)
  res.json({
    success: true,
    message: "Login successful",
    token
  })
}
