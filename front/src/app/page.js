"use client";

import { useEffect, useState, useRef } from "react";
import { SendHorizonal } from "lucide-react";

export default function Home() {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const ws = useRef(null);
  const [username, setUsername] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:3001");

    ws.current.onopen = () => {
      console.log("WebSocket connecté");
      ws.current.send(username); // envoyer le nom au début
    };

    // Reception du message
    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);// s'assurer que le message est bien en format JSON
        console.log("Message reçu:", data);
        if (data.from && data.text) {
          setChat((prev) => [...prev, `${data.from}: ${data.text}`]);
        }
      } catch (e) {
        console.error("Erreur de parsing JSON:", e);
      }
    };

    ws.current.onclose = () => {
      console.log("WebSocket fermé");
    };

    return () => {
      ws.current.close();
    };
  }, []);

  const sendMessage = () => {
    if (ws.current && message.trim() !== '') {
      ws.current.send(message); // Envoie simplement le message
      setChat(prev => [...prev, `Moi: ${message}`]); // Affiche le message côté client
      setMessage('');
    }
  };

  return (
    <>
    {/* Form to set username */}
    {!isConnected ? (
    <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 px-4">
    <div className="bg-neutral-800 p-6 rounded-2xl shadow-2xl w-full max-w-sm">
      <h1 className="text-white text-2xl font-semibold mb-6 text-center">
        Connexion
      </h1>
      <input
        type="text"
        value={username}
        placeholder="Entrez votre nom"
        className="w-full mb-4 p-3 rounded-xl bg-neutral-700 text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
        onChange={(e) => setUsername(e.currentTarget.value)}
      />
      <button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-md"
        onClick={() => {
          ws.current.send(username);
          setIsConnected(true);
        }}
      >
        Se connecter
      </button>
    </div>
  </div>
  ) :
    <div className="flex flex-col justify-end h-screen bg-neutral-900 p-4">
      <div className="flex items-center justify-between mx-10 text-white font-bold text-2xl mb-4 py-2">
      <div className="flex items-center">
        <img src="./favicon.ico" alt="Logo" className="w-12 h-12 mr-2" />
        <p>MessengerApp</p>
      </div>
        <p className="flex justify-center text-center">Bonjour {username}</p>
      </div>
      <div className="bg-neutral-800 w-full h-full rounded-bl-4xl rounded-tl-4xl px-8 py-4 overflow-y-auto text-white overflow-hidden scrollbar">
        {chat.map((msg, i) => (
          <div key={i} className="mb-2">{msg}</div>
        ))}
      </div>
      <div className="flex bg-neutral-800 w-full h-20 rounded-tl-full rounded-bl-full mt-4 px-8">
        <input
          type="text"
          value={message}
          placeholder="Entre votre message"
          className="justify-center w-full text-neutral-200 text-xl outline-none"
          onChange={(e) => setMessage(e.currentTarget.value)}
          onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
        />
        {message && (
          <SendHorizonal
            size={35}
            className="h-full text-neutral-500 hover:text-white hover:scale-110 duration-300 cursor-pointer"
            onClick={sendMessage}
          />
        )}
      </div>
    </div>}
    </>
  );
}
