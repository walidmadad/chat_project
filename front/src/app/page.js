"use client";

import { useEffect, useState, useRef } from "react";
import { SendHorizonal } from "lucide-react";

export default function Home() {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const ws = useRef(null);
  const username = "mehdi"; // ou tu peux demander via prompt()

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:3001");

    ws.current.onopen = () => {
      console.log("WebSocket connecté");
      ws.current.send(username); // envoyer le nom au début
    };

    ws.current.onmessage = (event) => {
      setChat(prev => [...prev, event.data]);
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
      ws.current.send(message);
      setChat(prev => [...prev, `Moi: ${message}`]);
      setMessage('');
    }
  };

  return (
    <div className="flex flex-col justify-end h-screen bg-neutral-900 p-4">
      <div className="bg-neutral-800 w-full h-full rounded-4xl p-8 overflow-y-auto text-white">
        {chat.map((msg, i) => (
          <div key={i} className="mb-2">{msg}</div>
        ))}
      </div>
      <div className="flex bg-neutral-800 w-full h-20 rounded-full mt-4 px-8">
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
    </div>
  );
}

