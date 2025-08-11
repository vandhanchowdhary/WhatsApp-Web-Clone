import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import ChatList from "./pages/ChatList";
import ChatWindow from "./pages/ChatWindow";
import SocketContext from "./context/SocketContext";

export default function App() {
  const [selected, setSelected] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const API = import.meta.env.VITE_API_URL || "http://localhost:4000";
    const s = io(API, {
      transports: ["websocket"], // force WS only
    });

    s.on("connect_error", (err) => console.warn("Socket connect_error", err));
    setSocket(s);

    return () => {
      if (s.connected) s.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      <div className="h-screen flex">
        <ChatList selectChat={setSelected} selected={selected} />
        {selected ? (
          <ChatWindow wa_id={selected} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a chat
          </div>
        )}
      </div>
    </SocketContext.Provider>
  );
}