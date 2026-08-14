import api from './api';

export const createCheckoutSession = async (courseId) => {
  const { data } = await api.post('/payments/create-checkout-session', {
    courseId,
  });
  return data;
};

export const confirmCheckoutSession = async (sessionId) => {
  const { data } = await api.post('/payments/confirm', { sessionId });
  return data;
};
