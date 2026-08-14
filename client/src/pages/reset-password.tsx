import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthScreen from '../components/layout/auth-screen';
import Button from '../components/ui/button';
import Heading from '../components/ui/heading';
import Input from '../components/ui/input';
import OtpInput from '../components/ui/otp-input';
import Text from '../components/ui/text';
import { useAuth } from '../context/auth-context';
import { getErrorMessage } from '../lib/cn';
import { useCountdown } from '../lib/use-countdown';
import api from '../lib/api';

export default function ResetPassword() {
  const { resendOtp, updateUser } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const email = params.get('email') || '';
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [ttl, setTtl] = useState(60);
  const [round, setRound] = useState(0);
  const remaining = useCountdown(ttl, round);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (otp.length !== 6) {
      setError('Enter the 6-digit code from your email.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('/auth/reset-password', { email, otp, password });
      updateUser(data.user);
      navigate(data.user.role === 'instructor' ? '/instructor' : '/my-learning');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Unable to reset your password.'));
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    if (remaining > 0) return;
    setBusy(true);
    setError('');
    try {
      const data = await resendOtp(email, 'reset');
      setTtl(data.expiresIn || 60);
      setRound((value) => value + 1);
      setOtp('');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Unable to resend the code.'));
    } finally {
      setBusy(false);
    }
  };

  if (!email) {
    return (
      <AuthScreen>
        <div className="w-full max-w-sm space-y-md">
          <Heading size="headline">Reset password</Heading>
          <Text muted>Start from the forgot password page so we can email you a code.</Text>
          <Button to="/forgot-password">Forgot password</Button>
        </div>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen>
      <form onSubmit={submit} className="w-full max-w-sm space-y-5">
        <div className="space-y-sm">
          <Heading size="headline">Reset password</Heading>
          <Text muted>Enter the code sent to {email} and choose a new password.</Text>
        </div>
        {error ? <Text tone="error">{error}</Text> : null}
        <OtpInput value={otp} onChange={setOtp} disabled={busy} />
        <Input
          label="New password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={6}
          required
        />
        <Button type="submit" className="w-full" disabled={busy || otp.length !== 6}>
          {busy ? 'Saving...' : 'Update password'}
        </Button>
        <Text muted size="sm" className="text-center">
          {remaining > 0 ? (
            <>Resend code in 0:{String(remaining).padStart(2, '0')}</>
          ) : (
            <button type="button" className="font-medium text-primary" onClick={() => void resend()}>
              Resend code
            </button>
          )}
        </Text>
        <Text muted size="sm" className="text-center">
          <Link to="/login" className="font-medium text-primary">
            Back to login
          </Link>
        </Text>
      </form>
    </AuthScreen>
  );
}
