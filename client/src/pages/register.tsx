import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthScreen from '../components/layout/auth-screen';
import Button from '../components/ui/button';
import Heading from '../components/ui/heading';
import Input from '../components/ui/input';
import Text from '../components/ui/text';
import { useAuth } from '../context/auth-context';
import { getErrorMessage } from '../lib/cn';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student' as 'student' | 'instructor',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const pending = await register(form);
      navigate(`/verify-email?email=${encodeURIComponent(pending.email || form.email)}`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Unable to create account.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthScreen>
      <form onSubmit={handleSubmit} className="w-full space-y-5">
        <div className="space-y-sm">
          <Heading size="headline">Create your account</Heading>
          <Text muted>Join LearnHub as a student or instructor.</Text>
        </div>
        {error ? <Text tone="error">{error}</Text> : null}
        <Input
          label="Name"
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          required
        />
        <Input
          label="Email address"
          type="email"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          required
        />
        <Input
          label="Password"
          type="password"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          required
          minLength={6}
        />
        <div className="flex gap-sm">
          {(['student', 'instructor'] as const).map((role) => (
            <Button
              key={role}
              type="button"
              variant={form.role === role ? 'primary' : 'secondary'}
              className="flex-1 capitalize"
              onClick={() => setForm((prev) => ({ ...prev, role }))}
            >
              {role}
            </Button>
          ))}
        </div>
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? 'Sending code...' : 'Sign up'}
        </Button>
        <Text muted size="sm">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary">
            Log in
          </Link>
        </Text>
      </form>
    </AuthScreen>
  );
}
