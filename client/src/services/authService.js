import api from './api';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

const persistAuth = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

export const registerUser = async (data) => {
  const { data: response } = await api.post('/auth/register', data);
  const token = response.token;
  const user = response.user ?? {
    name: data.name,
    email: data.email,
    role: data.role || 'student',
  };

  persistAuth(token, user);
  return { token, user };
};

export const loginUser = async (data) => {
  const { data: response } = await api.post('/auth/login', data);
  const { token, user } = response;

  persistAuth(token, user);
  return { token, user };
};

export const logoutUser = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const persistUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getStoredAuth = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  const rawUser = localStorage.getItem(USER_KEY);

  if (!token || !rawUser) {
    return { token: null, user: null };
  }

  try {
    return { token, user: JSON.parse(rawUser) };
  } catch {
    return { token: null, user: null };
  }
};
