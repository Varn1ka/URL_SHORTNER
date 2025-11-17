// worker.js
const { popFromQueue } = require("./redis");

console.log("🔧 Worker Started...");

async function runWorker() {
    while (true) {
        const task = await popFromQueue();

        if (task) {
            const job = JSON.parse(task);
            console.log("📦 Processing Job:", job);

            if (job.type === "log_url") {
                console.log("📝 Logging URL:", job.data.shortId);
            }

            if (job.type === "delete_log") {
                console.log("❌ URL Deleted:", job.data.shortId);
            }
        }

        await new Promise((res) => setTimeout(res, 500));
    }
}

runWorker();
