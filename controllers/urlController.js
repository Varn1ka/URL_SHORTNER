const Url = require("../models/url");
const { nanoid } = require("nanoid");
const { redis, publisher, pushToQueue } = require("../redisClient");

// CREATE SHORT URL
module.exports.postShortenUrl = async (req, res) => {
  try {
    const originalUrl = req.body.originalUrl;
    const shortId = nanoid(7);
    const url = await Url.create({ originalUrl, shortId, owner: req.user.sub });

    await redis.set(shortId, originalUrl);
    await publisher.publish("url-events", `URL_CREATED:${shortId}`);
    await pushToQueue({ type: "log_url", data: url });
    req.app.locals.broadcast("url-created", { shortUrl: `${req.protocol}://${req.get("host")}/${shortId}`, ...url._doc });

    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.redirect("/dashboard");
  }
};

// GET USER URLS
module.exports.getMyUrls = async (req, res) => {
  try {
    const urls = await Url.find({ owner: req.user.sub });
    const baseUrl = `http://localhost:3000`;
    res.render("dashboard", { user: req.user, urls, baseUrl });
  } catch (err) {
    console.error(err);
    res.render("dashboard", { user: req.user, urls: [], baseUrl: "" });
  }
};

// DELETE URL
module.exports.deleteUrl = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Url.findOneAndDelete({ _id: id, owner: req.user.sub });

    if (deleted) {
      await redis.del(deleted.shortId);
      await publisher.publish("url-events", `URL_DELETED:${deleted.shortId}`);
      await pushToQueue({ type: "delete_log", data: deleted });
      req.app.locals.broadcast("url-deleted", deleted);
    }

    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.redirect("/dashboard");
  }
};

// REDIRECT SHORT URL
module.exports.redirectShortUrl = async (req, res) => {
  try {
    const { shortId } = req.params;

    // Try to get original URL from Redis cache
    let originalUrl = await redis.get(shortId);

    if (!originalUrl) {
      // If not in Redis, fetch from DB
      const url = await Url.findOne({ shortId });
      if (!url) return res.status(404).send("URL not found");

      originalUrl = url.originalUrl;

      // Optionally, cache in Redis
      await redis.set(shortId, originalUrl);
    }

    // Redirect to original URL
    res.redirect(originalUrl);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};
