const Url = require("../models/url")
const { nanoid } = require("nanoid")

module.exports.postShortenUrl = async (req, res) => {
  let originalUrl = req.body.originalUrl
  let shortId = nanoid(7)

  let url = new Url({
    originalUrl: originalUrl,
    shortId: shortId,
    owner: req.user.sub
  })

  await url.save()
  res.json({
    success: true,
    message: "URL shortened successfully",
    data: { shortUrl: `${process.env.BASE_URL}/${shortId}`, shortId: shortId }
  })
}

module.exports.getMyUrls = async (req, res) => {
  let urls = await Url.find({ owner: req.user.sub })
  res.json({
    success: true,
    message: "URLs fetched successfully",
    data: urls
  })
}

module.exports.deleteUrl = async (req, res) => {
  let id = req.params.id
  await Url.findOneAndDelete({ _id: id, owner: req.user.sub })
  res.json({
    success: true,
    message: "URL deleted successfully"
  })
}
