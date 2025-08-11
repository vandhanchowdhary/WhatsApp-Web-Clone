import axios from "axios";

// TODO: Change to deployed backend URL later
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

const api = axios.create({
  baseURL: API_BASE,
});

export const getConversations = () => api.get("/api/conversations");
export const getMessages = (wa_id) => api.get(`/api/messages/${wa_id}`);
export const sendMessage = (wa_id, text) =>
  api.post(`/api/messages/${wa_id}/send`, { text });
