const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

function auth(req, res, next) {
    const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(" ")[1]);
    if (!token) return res.redirect("/login");

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { sub, email }
        next();
    } catch (err) {
        return res.redirect("/login");
    }
}

module.exports = { auth };
