import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthScreen from '../components/layout/auth-screen';
import Button from '../components/ui/button';
import Heading from '../components/ui/heading';
import OtpInput from '../components/ui/otp-input';
import Text from '../components/ui/text';
import { useAuth } from '../context/auth-context';
import { getErrorMessage } from '../lib/cn';
import { useCountdown } from '../lib/use-countdown';

export default function VerifyEmail() {
  const { verifyEmail, resendOtp } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const email = params.get('email') || '';
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [ttl, setTtl] = useState(60);
  const [round, setRound] = useState(0);
  const remaining = useCountdown(ttl, round);

  const masked = useMemo(() => {
    const [name, domain] = email.split('@');
    if (!name || !domain) return email;
    return `${name.slice(0, 2)}•••@${domain}`;
  }, [email]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (otp.length !== 6) {
      setError('Enter the 6-digit code from your email.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const user = await verifyEmail(email, otp);
      navigate(user.role === 'instructor' ? '/instructor' : '/my-learning');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Unable to verify that code.'));
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    if (remaining > 0) return;
    setBusy(true);
    setError('');
    try {
      const data = await resendOtp(email, 'verify');
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
        <div className="w-full space-y-md">
          <Heading size="headline">Check your email</Heading>
          <Text muted>Start from sign up so we know where to send the code.</Text>
          <Button to="/register">Back to sign up</Button>
        </div>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen>
      <form onSubmit={submit} className="w-full space-y-5">
        <div className="space-y-sm">
          <Heading size="headline">Verify your email</Heading>
          <Text muted>We sent a 6-digit code to {masked}. It expires in 1 minute.</Text>
        </div>
        {error ? <Text tone="error">{error}</Text> : null}
        <OtpInput value={otp} onChange={setOtp} disabled={busy} />
        <Button type="submit" className="w-full" disabled={busy || otp.length !== 6}>
          {busy ? 'Verifying...' : 'Verify email'}
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
          Wrong email?{' '}
          <Link to="/register" className="font-medium text-primary">
            Sign up again
          </Link>
        </Text>
      </form>
    </AuthScreen>
  );
}
