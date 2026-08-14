import api from './api';

export const getDiscussions = async (courseId, lessonId) => {
  const { data } = await api.get('/discussions', {
    params: { courseId, lessonId },
  });
  return data;
};

export const createDiscussion = async (payload) => {
  const { data } = await api.post('/discussions', payload);
  return data;
};

export const replyToDiscussion = async (discussionId, message) => {
  const { data } = await api.post(`/discussions/${discussionId}/replies`, {
    message,
  });
  return data;
};
