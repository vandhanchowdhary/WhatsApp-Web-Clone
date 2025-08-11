import dayjs from "dayjs";

export default function MessageBubble({ message }) {
  const isOutbound = message.direction === "outbound";

  const statusIcons = {
    sent: "✔️",
    delivered: "✔✔",
    read: "✔✔", // Could style blue later
    received: "",
  };

  return (
    <div
      className={`flex ${isOutbound ? "justify-end" : "justify-start"} mb-2`}
    >
      <div
        className={`max-w-xs md:max-w-md px-3 py-2 rounded-lg text-sm shadow ${
          isOutbound ? "bg-green-200" : "bg-white"
        }`}
      >
        <p>{message.text}</p>
        <div className="text-xs text-gray-500 flex justify-end items-center gap-1">
          {dayjs(message.timestamp).format("HH:mm")}
          {isOutbound && <span>{statusIcons[message.status]}</span>}
        </div>
      </div>
    </div>
  );
}
