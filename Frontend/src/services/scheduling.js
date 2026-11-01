import api from "./api";

export const getLatestTimetable = async () => {
  const response = await api.get("/scheduling/latest");
  return response.data;
};

export const generateTimetable = async () => {
  const response = await api.post("/scheduling/generate", undefined, {
    timeout: 190000,
  });

  return response.data;
};

export default {
  getLatestTimetable,
  generateTimetable,
};
