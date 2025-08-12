import dayjs from "dayjs";

export default function MessageBubble({ message }) {
  const isOutbound = message.direction === "outbound";

  // SVG icons with WhatsApp-style alignment
  const TickIcons = {
    sent: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 18 18"
        width="16"
        height="16"
        className="fill-gray-500"
      >
        <path d="M6.61 13.17L2.83 9.39l1.41-1.41 2.37 2.37 5.85-5.85 1.41 1.41z" />
      </svg>
    ),
    delivered: (
      <div className="relative w-[20px] h-[16px]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 18 18"
          width="16"
          height="16"
          className="absolute left-[3px] top-0 fill-gray-500"
        >
          <path d="M6.61 13.17L2.83 9.39l1.41-1.41 2.37 2.37 5.85-5.85 1.41 1.41z" />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 18 18"
          width="16"
          height="16"
          className="absolute left-0 top-0 fill-gray-500"
        >
          <path d="M6.61 13.17L2.83 9.39l1.41-1.41 2.37 2.37 5.85-5.85 1.41 1.41z" />
        </svg>
      </div>
    ),
    read: (
      <div className="relative w-[20px] h-[16px]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 18 18"
          width="16"
          height="16"
          className="absolute left-[3px] top-0 fill-blue-500"
        >
          <path d="M6.61 13.17L2.83 9.39l1.41-1.41 2.37 2.37 5.85-5.85 1.41 1.41z" />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 18 18"
          width="16"
          height="16"
          className="absolute left-0 top-0 fill-blue-500"
        >
          <path d="M6.61 13.17L2.83 9.39l1.41-1.41 2.37 2.37 5.85-5.85 1.41 1.41z" />
        </svg>
      </div>
    ),
  };

  return (
    <div
      className={`flex ${isOutbound ? "justify-end" : "justify-start"} mb-2`}
    >
      <div
        className={`max-w-sm md:max-w-md px-3 py-2 rounded-lg text-sm shadow ${
          isOutbound ? "bg-green-200" : "bg-white"
        }`}
      >
        <p className="text-black">{message.text}</p>
        <div className="text-xs text-gray-500 flex justify-end items-center gap-1">
          {dayjs(message.timestamp).format("HH:mm")}
          {isOutbound && TickIcons[message.status]}
        </div>
      </div>
    </div>
  );
}
