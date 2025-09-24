const express = require("express");
const router = express.Router();

const { postShortenUrl, getMyUrls, deleteUrl } = require("../controllers/urlController");
const { auth } = require("../middleware/authMiddleware");  // pick only the function

// URL routes (protected by auth middleware)
router.post("/shorten", auth, postShortenUrl);
router.get("/myurls", auth, getMyUrls);
router.delete("/:id", auth, deleteUrl);

module.exports = router;
