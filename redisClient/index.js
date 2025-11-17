const Redis = require("ioredis");
const redis = new Redis();
const subscriber = new Redis();
const publisher = new Redis();

const pushToQueue = async (data) => {
  await redis.lpush("urlQueue", JSON.stringify(data));
};

subscriber.subscribe("url-events", (err, count) => {
  if (err) console.error(err);
  console.log("Subscribed to URL events channel");
});

subscriber.on("message", (channel, message) => {
  console.log("Received:", message);
});

module.exports = { redis, subscriber, publisher, pushToQueue };
