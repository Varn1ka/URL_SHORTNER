const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { postShortenUrl, getMyUrls, deleteUrl, redirectShortUrl } = require("../controllers/urlController");

router.post("/shorten", authMiddleware, postShortenUrl);
router.delete("/:id", authMiddleware, deleteUrl);
router.get("/dashboard", authMiddleware, getMyUrls);

router.get("/:shortId", redirectShortUrl);

module.exports = router;
