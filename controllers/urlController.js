const Url = require("../models/url");
const { nanoid } = require("nanoid");

// ----------------------
// CREATE SHORT URL
// ----------------------
module.exports.postShortenUrl = async (req, res) => {
  try {
    const originalUrl = req.body.originalUrl;
    const shortId = nanoid(7);

    const url = new Url({
      originalUrl,
      shortId,
      owner: req.user.id,
    });

    await url.save();

    // Redirect back to dashboard instead of showing JSON
    return res.redirect("/dashboard");

  } catch (err) {
    console.error(err);
    return res.redirect("/dashboard");
  }
};

// ----------------------
// FETCH USER'S URL LIST
// ----------------------
module.exports.getMyUrls = async (req, res) => {
  try {
    const urls = await Url.find({ owner: req.user.id });

    // Render dashboard with updated URLs
    return res.render("dashboard", { urls });
  } catch (err) {
    console.error(err);
    return res.render("dashboard", { urls: [] });
  }
};

// ----------------------
// DELETE URL
// ----------------------
module.exports.deleteUrl = async (req, res) => {
  try {
    const id = req.params.id;

    await Url.findOneAndDelete({
      _id: id,
      owner: req.user.id,
    });

    // Redirect back to dashboard
    return res.redirect("/dashboard");

  } catch (err) {
    console.error(err);
    return res.redirect("/dashboard");
  }
};
