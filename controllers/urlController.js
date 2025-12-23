const Url = require("../models/url");
const { nanoid } = require("nanoid");
const { redis, publisher, pushToQueue } = require("../redisClient");

module.exports.postShortenUrl = async (req, res) => {
  try {
    const { originalUrl, customAlias } = req.body;

    let shortId;
    if (customAlias && customAlias.trim() !== "") {
      const exists = await Url.findOne({ shortId: customAlias });

      if (exists) {
        return res.json({
          success: false,
          message: "This custom short URL is already taken!",
        });
      }

      shortId = customAlias; 
    } else {
    
      shortId = nanoid(7);
    }

    const url = await Url.create({
      originalUrl,
      shortId,
      owner: req.user.sub,
    });

    await redis.set(shortId, originalUrl);

    await publisher.publish("url-events", `URL_CREATED:${shortId}`);
    await pushToQueue({ type: "log_url", data: url });

    req.app.locals.broadcast("url-created", {
      shortUrl: `${req.protocol}://${req.get("host")}/${shortId}`,
      ...url._doc,
    });

    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.redirect("/dashboard");
  }
};

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

module.exports.redirectShortUrl = async (req, res) => {
  try {
    const { shortId } = req.params;
    let originalUrl = await redis.get(shortId);

    if (!originalUrl) {
      const url = await Url.findOne({ shortId });
      if (!url) return res.status(404).send("URL not found");

      originalUrl = url.originalUrl;
      await redis.set(shortId, originalUrl);
    }

    res.redirect(originalUrl);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};
