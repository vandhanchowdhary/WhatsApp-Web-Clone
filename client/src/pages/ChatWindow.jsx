import { useEffect, useState, useContext, useRef } from "react";
import { getMessages } from "../services/api";
import MessageBubble from "../components/MessageBubble";
import SendBox from "../components/SendBox";
import SocketContext from "../context/SocketContext";

export default function ChatWindow({ wa_id, goBack }) {
  const [messages, setMessages] = useState([]);
  const socket = useContext(SocketContext);
  const listRef = useRef();

  // load messages when wa_id changes
  useEffect(() => {
    if (!wa_id) return;
    (async () => {
      try {
        const res = await getMessages(wa_id);
        setMessages(res.data);
      } catch (err) {
        console.error("Error loading messages", err);
      }
    })();
  }, [wa_id]);

  // scroll to bottom when messages change
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  // socket event listeners
  useEffect(() => {
    if (!socket) return;

    function onNewMessage(msg) {
      if (msg.wa_id === wa_id) {
        setMessages((prev) => [...prev, msg]);
      }
    }

    function onStatusUpdate(s) {
      setMessages((prev) =>
        prev.map((m) =>
          m.msg_id === s.msg_id ? { ...m, status: s.status } : m
        )
      );
    }

    socket.on("message:new", onNewMessage);
    socket.on("message:status", onStatusUpdate);

    return () => {
      socket.off("message:new", onNewMessage);
      socket.off("message:status", onStatusUpdate);
    };
  }, [socket, wa_id]);

  // Get contact name from the first message if available
  const contactName = messages.length > 0 ? messages[0].contact_name : "";

return (
  <div className="flex flex-col flex-1">
    {/* Header */}
    <div className="p-3 border-b bg-gray-100 flex items-center gap-2">
      {/* Back button only visible on mobile/tablet */}
      <button
        onClick={goBack}
        className="md:hidden text-gray-600 hover:text-black"
      >
        ⬅
      </button>
      <h2 className="font-semibold truncate">
        {contactName ? `${contactName} (${wa_id})` : wa_id}
      </h2>
    </div>

    {/* Messages */}
    <div ref={listRef} className="flex-1 p-3 overflow-y-auto bg-green-50">
      {messages.map((msg) => (
        <MessageBubble key={msg.msg_id} message={msg} />
      ))}
    </div>

    {/* Send box */}
    <SendBox wa_id={wa_id} onMessageSent={() => {}} />
  </div>
);
}
