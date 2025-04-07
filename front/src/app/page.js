"use client"; // Indique que ce fichier est destiné à être exécuté côté client (React Server Components).

import { useEffect, useState, useRef } from "react"; // Importation des hooks React.
import { SendHorizonal } from "lucide-react"; // Importation d'une icône pour l'envoi des messages.

export default function Home() {
  // Déclaration des états pour gérer les données de l'application.
  const [message, setMessage] = useState(''); // Message en cours de saisie.
  const [chat, setChat] = useState([]); // Historique des messages.
  const ws = useRef(null); // Référence pour la connexion WebSocket.
  const [username, setUsername] = useState(""); // Nom d'utilisateur.
  const [isConnected, setIsConnected] = useState(false); // État de connexion.

  // Hook useEffect pour initialiser la connexion WebSocket.
  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:3001"); // Connexion au serveur WebSocket.

    ws.current.onopen = () => {
      console.log("WebSocket connecté");
      ws.current.send(username); // Envoie le nom d'utilisateur au serveur lors de la connexion.
    };

    // Gestion des messages reçus via WebSocket.
    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data); // Parse le message reçu en JSON.
        console.log("Message reçu:", data);
        if (data.from && data.text) {
          // Ajoute le message reçu à l'historique du chat.
          setChat((prev) => [...prev, `${data.from}: ${data.text}`]);
        }
      } catch (e) {
        console.error("Erreur de parsing JSON:", e); // Gère les erreurs de parsing JSON.
      }
    };

    ws.current.onclose = () => {
      console.log("WebSocket fermé"); // Log lorsque la connexion WebSocket est fermée.
    };

    // Nettoyage : ferme la connexion WebSocket lorsque le composant est démonté.
    return () => {
      ws.current.close();
    };
  }, []);

  // Fonction pour envoyer un message via WebSocket.
  const sendMessage = () => {
    if (ws.current && message.trim() !== '') {
      ws.current.send(message); // Envoie le message au serveur WebSocket.
      setChat(prev => [...prev, `Moi: ${message}`]); // Ajoute le message à l'historique côté client.
      setMessage(''); // Réinitialise le champ de saisie.
    }
  };

  return (
    <>
      {/* Formulaire pour définir le nom d'utilisateur */}
      {!isConnected ? (
        <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 px-4">
          <div className="bg-neutral-800 p-6 rounded-2xl shadow-2xl w-full max-w-sm">
            <h1 className="text-white text-2xl font-semibold mb-6 text-center">
              Connexion
            </h1>
            <input
              type="text"
              value={username} // Champ pour saisir le nom d'utilisateur.
              placeholder="Entrez votre nom"
              className="w-full mb-4 p-3 rounded-xl bg-neutral-700 text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              onChange={(e) => setUsername(e.currentTarget.value)} // Met à jour l'état `username`.
            />
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-md"
              onClick={() => {
                ws.current.send(username); // Envoie le nom d'utilisateur au serveur.
                setIsConnected(true); // Passe à l'état connecté.
              }}
            >
              Se connecter
            </button>
          </div>
        </div>
      ) : (
        // Interface principale de chat après connexion.
        <div className="flex flex-col justify-end h-screen bg-neutral-900 p-4">
          {/* En-tête avec le nom d'utilisateur */}
          <div className="flex items-center justify-between mx-10 text-white font-bold text-2xl mb-4 py-2">
            <div className="flex items-center">
              <img src="./favicon.ico" alt="Logo" className="w-12 h-12 mr-2" /> {/* Logo */}
              <p>MessengerApp</p>
            </div>
            <p className="flex justify-center text-center">Bonjour {username}</p>
          </div>

          {/* Zone d'affichage des messages */}
          <div className="bg-neutral-800 w-full h-full rounded-bl-4xl rounded-tl-4xl px-8 py-4 overflow-y-auto text-white overflow-hidden scrollbar">
            {chat.map((msg, i) => (
              <div key={i} className="mb-2">{msg}</div> // Affiche chaque message de l'historique.
            ))}
          </div>

          {/* Zone de saisie des messages */}
          <div className="flex bg-neutral-800 w-full h-20 rounded-full mt-4 px-8">
            <input
              type="text"
              value={message} // Champ de saisie pour le message.
              placeholder="Entre votre message"
              className="justify-center w-full text-neutral-200 text-xl outline-none"
              onChange={(e) => setMessage(e.currentTarget.value)} // Met à jour l'état `message`.
              onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }} // Envoie le message si "Enter" est pressé.
            />
            {message && (
              <SendHorizonal
                size={35}
                className="h-full text-neutral-500 hover:text-white hover:scale-110 duration-300 cursor-pointer"
                onClick={sendMessage} // Envoie le message lorsqu'on clique sur l'icône.
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}