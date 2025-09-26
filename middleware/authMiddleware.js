const jwt = require("jsonwebtoken");

const JWT_SECRET = "mySuperSecretKey123"; 

function auth(req, res, next) {
    console.log("Running auth middleware");
    const token = req.headers.authorization; 
    if (!token) {
        return res.json({
            success: false,
            message: "Authorization required"
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET); 
        req.user = decoded;
        next();
    } catch {
        res.json({
            success: false,
            message: "Invalid token"
        });
    }
}

function isLogin(req, res, next) {
    console.log("Running isLogin middleware");
    next();
}

function checkAdmin(req, res, next) {
    console.log("Running checkAdmin middleware");
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

module.exports.auth = auth;
module.exports.isLogin = isLogin;
module.exports.checkAdmin = checkAdmin;