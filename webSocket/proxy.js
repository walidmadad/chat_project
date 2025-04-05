// proxy.js
const net = require("net");
const WebSocket = require("ws");

const TCP_SERVER_HOST = "127.0.0.1";
const TCP_SERVER_PORT = 2525;
const WS_PORT = 3001;

const wss = new WebSocket.Server({ port: WS_PORT });
console.log(`WebSocket Server lancé sur ws://localhost:${WS_PORT}`);

wss.on("connection", (ws) => {
  const tcpClient = new net.Socket();

  tcpClient.connect(TCP_SERVER_PORT, TCP_SERVER_HOST, () => {
    console.log("Connecté au serveur C");

    // Recevoir le nom du client d'abord
    ws.once("message", (name) => {
      tcpClient.write(name);
    });

    ws.on("message", (msg) => {
      tcpClient.write(msg);
    });

    tcpClient.on("data", (data) => {
      ws.send(data.toString());
    });

    tcpClient.on("close", () => {
      ws.close();
    });

    tcpClient.on("error", (err) => {
      console.error("Erreur TCP:", err.message);
      ws.close();
    });

    ws.on("close", () => {
      tcpClient.destroy();
    });
  });
});