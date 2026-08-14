import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthScreen from '../components/layout/auth-screen';
import Button from '../components/ui/button';
import Heading from '../components/ui/heading';
import Input from '../components/ui/input';
import Text from '../components/ui/text';
import { getErrorMessage } from '../lib/cn';
import api from '../lib/api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Unable to send a reset code.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthScreen>
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
        <div className="space-y-sm">
          <Heading size="headline">Forgot password</Heading>
          <Text muted>Enter your email and we will send a 1-minute reset code.</Text>
        </div>
        {error ? <Text tone="error">{error}</Text> : null}
        <Input
          label="Email address"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? 'Sending code...' : 'Send reset code'}
        </Button>
        <Text muted size="sm">
          Remembered it?{' '}
          <Link to="/login" className="font-medium text-primary">
            Log in
          </Link>
        </Text>
      </form>
    </AuthScreen>
  );
}
