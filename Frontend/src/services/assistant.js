import api from "./api";

export const sendChatMessage = async (message) => {
  const response = await api.post("/assistant/chat", { message });
  return response.data;
};

export default {
  sendChatMessage,
};
