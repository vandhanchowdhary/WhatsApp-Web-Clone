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
        {/* Chat List */}
        <div
          className={`${
            selected ? "hidden md:flex w-full md:w-[40%] lg:w-[30%]" : "flex md:flex max-md:w-full"
          } flex-col transition-all duration-200`}
        >
          <div className="flex border-b justify-center items-center bg-green-200">
            <h2 className="font-semibold text-lg p-2">Chats</h2>
          </div>
          <ChatList selectChat={setSelected} selected={selected} />
        </div>

        {/* Chat Window */}
        <div
          className={`flex-1 border-l-1 ${
            selected ? "flex flex-col" : "hidden md:flex md:flex-col"
          }`}
        >
          {selected ? (
            <ChatWindow wa_id={selected} goBack={() => setSelected(null)} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-lg bg-green-50 text-gray-500">
              Select a chat
            </div>
          )}
        </div>
      </div>
    </SocketContext.Provider>
  );
}