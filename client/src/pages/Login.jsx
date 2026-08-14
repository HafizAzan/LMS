import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!EMAIL_REGEX.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address';
    }

    if (!form.password) {
      nextErrors.password = 'Password is required';
    } else if (form.password.length < MIN_PASSWORD_LENGTH) {
      nextErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    setLoading(true);
    setServerError('');

    try {
      const result = await login({
        email: form.email.trim(),
        password: form.password,
      });
      navigate(result.user?.role === 'instructor' ? '/instructor' : '/my-learning');
    } catch (error) {
      setServerError(
        error.response?.data?.message || 'Unable to log in. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <h1>Login</h1>
      <p>Sign in to continue to your courses.</p>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {serverError ? <p className="form-error">{serverError}</p> : null}

        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
        />
        {errors.email ? <p className="field-error">{errors.email}</p> : null}

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={handleChange}
        />
        {errors.password ? (
          <p className="field-error">{errors.password}</p>
        ) : null}

        <button type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="auth-switch">
        Need an account? <Link to="/register">Register</Link>
      </p>
    </main>
  );
}

export default Login;
