import api from './api';

export const getQuizzesByCourse = async (courseId, lessonId) => {
  const params = {};
  if (lessonId) {
    params.lessonId = lessonId;
  }

  const { data } = await api.get(`/quizzes/course/${courseId}`, { params });
  return data;
};

export const submitQuiz = async (quizId, answers) => {
  const { data } = await api.post(`/quizzes/${quizId}/submit`, { answers });
  return data;
};
