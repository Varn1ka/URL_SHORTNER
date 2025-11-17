const Url = require("../models/url");
const { nanoid } = require("nanoid");
const { redis, publisher, pushToQueue } = require("../redis");
const { broadcast } = require("../ws");

// CREATE SHORT URL
module.exports.postShortenUrl = async (req, res) => {
  try {
    const originalUrl = req.body.originalUrl;
    const shortId = nanoid(7);

    const url = await Url.create({ originalUrl, shortId, owner: req.user.sub });

    await redis.set(shortId, originalUrl);
    await publisher.publish("url-events", `URL_CREATED:${shortId}`);
    await pushToQueue({ type: "log_url", data: url });
    broadcast("url-created", url);

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
    res.render("dashboard", { user: req.user, urls, baseUrl: `http://localhost:${process.env.PORT || 3000}` });
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
      broadcast("url-deleted", deleted);
    }

    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.redirect("/dashboard");
  }
};
