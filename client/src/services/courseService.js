import api from './api';

export const getCourses = async (params = {}) => {
  const { data } = await api.get('/courses', { params });
  return data;
};

export const getCourseById = async (id) => {
  const { data } = await api.get(`/courses/${id}`);
  return data;
};

export const enrollInCourse = async (id) => {
  const { data } = await api.post(`/courses/${id}/enroll`);
  return data;
};

export const getInstructorCourses = async () => {
  const { data } = await api.get('/courses/instructor/mine');
  return data;
};

export const createCourse = async (payload) => {
  const { data } = await api.post('/courses', payload);
  return data;
};

export const updateCourse = async (id, payload) => {
  const { data } = await api.put(`/courses/${id}`, payload);
  return data;
};

export const deleteCourse = async (id) => {
  const { data } = await api.delete(`/courses/${id}`);
  return data;
};

export const uploadCourseThumbnail = async (id, file) => {
  const formData = new FormData();
  formData.append('thumbnail', file);
  const { data } = await api.post(`/courses/${id}/thumbnail`, formData);
  return data;
};

export const createLesson = async (courseId, { title, duration, order, video, resources }) => {
  const formData = new FormData();
  formData.append('title', title);
  if (duration !== undefined) {
    formData.append('duration', duration);
  }
  if (order !== undefined) {
    formData.append('order', order);
  }
  if (video) {
    formData.append('video', video);
  }
  (resources || []).forEach((file) => {
    formData.append('resources', file);
  });

  const { data } = await api.post(`/courses/${courseId}/lessons`, formData);
  return data;
};

export const getCourseAnalytics = async (courseId) => {
  const { data } = await api.get(`/instructor/courses/${courseId}/analytics`);
  return data;
};
