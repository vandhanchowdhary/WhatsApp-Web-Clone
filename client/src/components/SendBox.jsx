import { useState } from "react";
import { sendMessage } from "../services/api";

export default function SendBox({ wa_id, onMessageSent }) {
  const [text, setText] = useState("");

  async function handleSend(e) {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const res = await sendMessage(wa_id, text);
      onMessageSent(res.data);
      setText("");
    } catch (err) {
      console.error("Error sending message", err);
    }
  }

  return (
    <form
      onSubmit={handleSend}
      className="p-3 border-t bg-gray-100 flex items-center gap-2"
    >
      <input
        type="text"
        className="flex-1 p-2 rounded border bg-green-50 border-gray-300"
        placeholder="Type a message"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        type="submit"
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Send
      </button>
    </form>
  );
}