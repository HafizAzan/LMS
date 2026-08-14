import api from './api';

export const askCourseAssistant = async ({ courseId, lessonId, message }) => {
  const { data } = await api.post('/ai/chat', { courseId, lessonId, message });
  return data;
};
