const Redis = require("ioredis");

const redis = new Redis({
  host: process.env.REDIS_HOST || "redis",  // <- use container service name
  port: 6379,
});

const subscriber = new Redis({
  host: process.env.REDIS_HOST || "redis",
  port: 6379,
});

const publisher = new Redis({
  host: process.env.REDIS_HOST || "redis",
  port: 6379,
});

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
