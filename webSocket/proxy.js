// Importation des modules nécessaires
const net = require("net"); // Module pour gérer les connexions TCP
const WebSocket = require("ws"); // Module pour gérer les connexions WebSocket

// Configuration des constantes
const TCP_SERVER_HOST = "127.0.0.1"; // Adresse IP du serveur TCP
const TCP_SERVER_PORT = 2525; // Port du serveur TCP
const WS_PORT = 3001; // Port pour le serveur WebSocket

// Création du serveur WebSocket
const wss = new WebSocket.Server({ port: WS_PORT });
console.log(`WebSocket Server lancé sur ws://localhost:${WS_PORT}`);

// Gestion des connexions WebSocket
wss.on("connection", (ws) => {
  // Création d'un client TCP pour se connecter au serveur C
  const tcpClient = new net.Socket();

  // Connexion au serveur TCP
  tcpClient.connect(TCP_SERVER_PORT, TCP_SERVER_HOST, () => {
    console.log("Connecté au serveur C");

    // Recevoir le nom du client via WebSocket (premier message)
    ws.once("message", (name) => {
      tcpClient.write(name); // Envoie le nom du client au serveur TCP
    });

    // Gestion des messages WebSocket
    ws.on("message", (msg) => {
      tcpClient.write(msg); // Transfère les messages WebSocket au serveur TCP
    });

    // Gestion des données reçues du serveur TCP
    tcpClient.on("data", (data) => {
      ws.send(data.toString()); // Transfère les données du serveur TCP au client WebSocket
    });

    // Gestion de la fermeture de la connexion TCP
    tcpClient.on("close", () => {
      ws.close(); // Ferme la connexion WebSocket si la connexion TCP est fermée
    });

    // Gestion des erreurs TCP
    tcpClient.on("error", (err) => {
      console.error("Erreur TCP:", err.message); // Affiche l'erreur dans la console
      ws.close(); // Ferme la connexion WebSocket en cas d'erreur TCP
    });

    // Gestion de la fermeture de la connexion WebSocket
    ws.on("close", () => {
      tcpClient.destroy(); // Détruit la connexion TCP si le client WebSocket se déconnecte
    });
  });
});