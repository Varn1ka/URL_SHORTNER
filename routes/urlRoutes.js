const router = require("express").Router();
const { postShortenUrl, getMyUrls, deleteUrl } = require("../controllers/urlController");
const { auth } = require("../middleware/authMiddleware");

router.get("/dashboard", auth, getMyUrls);
router.post("/dashboard/shorten", auth, postShortenUrl);
router.post("/:id/delete", auth, deleteUrl);

module.exports = router;
