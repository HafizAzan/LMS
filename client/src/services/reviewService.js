import api from './api';

export const getReviewsByCourse = async (courseId) => {
  const { data } = await api.get(`/reviews/course/${courseId}`);
  return data;
};

export const createReview = async (payload) => {
  const { data } = await api.post('/reviews', payload);
  return data;
};

export const updateReview = async (reviewId, payload) => {
  const { data } = await api.put(`/reviews/${reviewId}`, payload);
  return data;
};

export const deleteReview = async (reviewId) => {
  const { data } = await api.delete(`/reviews/${reviewId}`);
  return data;
};
