const jwt = require("jsonwebtoken");
const JWT_SECRET = "mySuperSecretKey123";

function auth(req, res, next) {
    console.log("Running auth middleware");

    // Accept token from header or cookie
    let token = req.cookies.token || req.headers.authorization;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Authorization required"
        });
    }

    // If token comes as "Bearer xyz..."
    if (token.startsWith("Bearer ")) {
        token = token.split(" ")[1];
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;   // { id, email }
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
}

function isLogin(req, res, next) {
    next();
}

function checkAdmin(req, res, next) {
    let { name } = req.query;
    if (name === "Varnika") {
        req.isAdmin = true;
        return next();
    }
    res.json({
        success: false,
        message: "You are not an admin"
    });
}

module.exports = { auth, isLogin, checkAdmin };
