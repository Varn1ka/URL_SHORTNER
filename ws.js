const WebSocket = require("ws");
let wss;

function initWebSocket(server) {
    wss = new WebSocket.Server({ server });
    wss.on("connection", (socket) => socket.send(JSON.stringify({ message: "WS Connected!" })));
}

function broadcast(event, data) {
    if (!wss) return;
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) client.send(JSON.stringify({ event, data }));
    });
}

module.exports = { initWebSocket, broadcast };
