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

module.exports.auth = auth;