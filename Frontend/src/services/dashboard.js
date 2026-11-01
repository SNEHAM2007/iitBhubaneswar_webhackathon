import api from "./api";

export const getDashboardOverview = async () => {
  const response = await api.get("/dashboard");
  return response.data;
};
