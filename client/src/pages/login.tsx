import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthScreen from '../components/layout/auth-screen';
import Button from '../components/ui/button';
import Heading from '../components/ui/heading';
import Input from '../components/ui/input';
import Text from '../components/ui/text';
import { useAuth } from '../context/auth-context';
import { getErrorMessage } from '../lib/cn';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const user = await login(email, password);
      navigate(user.role === 'instructor' ? '/instructor' : '/my-learning');
    } catch (err: unknown) {
      const payload =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { code?: string; email?: string; message?: string } } })
              .response?.data
          : null;
      if (payload?.code === 'EMAIL_NOT_VERIFIED') {
        navigate(`/verify-email?email=${encodeURIComponent(payload.email || email)}`);
        return;
      }
      setError(payload?.message || getErrorMessage(err, 'Unable to log in.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthScreen>
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
        <div className="space-y-sm">
          <Heading size="headline">Welcome back</Heading>
          <Text muted>Log in to continue your learning journey.</Text>
        </div>
        {error ? <Text tone="error">{error}</Text> : null}
        <Input
          label="Email address"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
        />
        <div className="space-y-base">
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            required
          />
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-caption font-medium text-primary">
              Forgot password?
            </Link>
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? 'Signing in...' : 'Log In'}
        </Button>
        <Text muted size="sm">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-primary">
            Sign up
          </Link>
        </Text>
      </form>
    </AuthScreen>
  );
}
