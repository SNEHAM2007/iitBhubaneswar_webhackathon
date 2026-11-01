import api from "./api";

export const getExams = async (params = {}) => {
  const response = await api.get("/exams", { params });
  return response.data;
};

export const getExamById = async (examId) => {
  const response = await api.get(`/exams/${examId}`);
  return response.data;
};

export const createExam = async (examData) => {
  const response = await api.post("/exams", examData);
  return response.data;
};

export const updateExam = async (examId, examData) => {
  const response = await api.patch(`/exams/${examId}`, examData);
  return response.data;
};

export const deleteExam = async (examId) => {
  const response = await api.delete(`/exams/${examId}`);
  return response.data;
};

export default {
  getExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
};
