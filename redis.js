const { createClient } = require("redis");

function createRedisClient() {
    const client = createClient({
        socket: { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT }
    });

    client.on("error", (err) => console.log("❌ Redis Error:", err));
    client.connect().catch(console.error);

    return client;
}

const redis = createRedisClient();
const publisher = createRedisClient();
const subscriber = createRedisClient();
const queue = createRedisClient();

subscriber.subscribe("url-events", (msg) => console.log("📩 Event Received:", msg));

async function pushToQueue(data) { await queue.lPush("task-queue", JSON.stringify(data)); }
async function popFromQueue() { return await queue.rPop("task-queue"); }

module.exports = { redis, publisher, subscriber, pushToQueue, popFromQueue };
