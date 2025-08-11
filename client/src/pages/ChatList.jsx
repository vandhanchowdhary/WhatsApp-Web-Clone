import { useEffect, useState, useContext } from "react";
import { getConversations } from "../services/api";
import dayjs from "dayjs";
import SocketContext from "../context/SocketContext";

export default function ChatList({ selectChat, selected }) {
  const [conversations, setConversations] = useState([]);
  const socket = useContext(SocketContext);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (!socket) return;

    function onNewMessage(msg) {
      // Move/insert the conversation at top with updated preview
      setConversations((prev) => {
        const others = prev.filter((c) => c.wa_id !== msg.wa_id);
        const contactName =
          msg.contact_name ||
          prev.find((p) => p.wa_id === msg.wa_id)?.contact_name ||
          null;
        const newConv = {
          wa_id: msg.wa_id,
          contact_name: contactName,
          last_text: msg.text,
          last_time: msg.timestamp,
          last_status: msg.status,
        };
        return [newConv, ...others];
      });
    }

    function onStatusUpdate(s) {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.wa_id === s.wa_id) return { ...c, last_status: s.status };
          return c;
        })
      );
    }

    socket.on("message:new", onNewMessage);
    socket.on("message:status", onStatusUpdate);

    return () => {
      socket.off("message:new", onNewMessage);
      socket.off("message:status", onStatusUpdate);
    };
  }, [socket]);

  async function loadConversations() {
    try {
      const res = await getConversations();
      setConversations(res.data);
    } catch (err) {
      console.error("Error loading conversations", err);
    }
  }

  return (
    <div className="w-full md:w-1/3 lg:w-1/4 bg-gray-100 border-r overflow-y-auto overflow-x-hidden">
      {conversations.map((conv) => (
        <div
          key={conv.wa_id}
          onClick={() => selectChat(conv.wa_id)}
          className={`flex items-center px-4 py-3 cursor-pointer hover:bg-gray-200 ${
            selected === conv.wa_id ? "bg-gray-300" : ""
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white text-lg font-bold">
            {conv.contact_name?.charAt(0) || conv.wa_id.slice(-2)}
          </div>
          <div className="flex-1 ml-3 w-[80%]">
            <div className="flex justify-between">
              <h2 className="font-semibold">
                {conv.contact_name || conv.wa_id}
              </h2>
              <span className="text-xs text-gray-500">
                {conv.last_time ? dayjs(conv.last_time).format("HH:mm") : ""}
              </span>
            </div>
            <p className="text-sm text-gray-600 truncate overflow-hidden whitespace-nowrap text-ellipsis">{conv.last_text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
