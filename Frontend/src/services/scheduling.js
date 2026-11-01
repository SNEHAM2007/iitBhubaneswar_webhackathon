import api from "./api";

export const generateTimetable = async () => {
  const response = await api.post("/scheduling/generate", undefined, {
    timeout: 190000,
  });

  return response.data;
};
