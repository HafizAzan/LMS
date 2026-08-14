import api from './api';

export const saveProgress = async (lessonId, data) => {
  const { data: response } = await api.post(
    `/lessons/${lessonId}/progress`,
    data,
  );
  return response;
};

export const getCourseProgress = async (courseId) => {
  const { data } = await api.get(`/courses/${courseId}/progress`);
  return data;
};

export const getMyLearning = async () => {
  const { data } = await api.get('/progress');
  return data;
};

export const getOverallProgress = async (courseId) => {
  const { data } = await api.get(`/progress/${courseId}`);
  return data;
};
