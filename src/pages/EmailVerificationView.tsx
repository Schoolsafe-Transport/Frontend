import { useState, useEffect, FC, FormEvent } from 'react';
import { verifyEmailApi, resendVerificationEmailApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';

interface EmailVerificationViewProps {
  onSuccess?: () => void;
  onNavigateToDashboard?: () => void;
  onSwitchToLogin?: () => void;
}

export const EmailVerificationView: FC<EmailVerificationViewProps> = ({
  onSuccess,
  onNavigateToDashboard,
  onSwitchToLogin,
}) => {
  const { user, refreshUser } = useAuth();
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'idle'>(
    token ? 'verifying' : 'idle'
  );
  const [message, setMessage] = useState<string>('');
  const [resendEmail, setResendEmail] = useState<string>(user?.email || '');
  const [resending, setResending] = useState<boolean>(false);
  const [resendStatus, setResendStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('idle');
      return;
    }

    let isMounted = true;

    const performVerification = async () => {
      setStatus('verifying');
      setMessage('Verifying your single-use email token with SchoolSafe servers...');

      try {
        const res = await verifyEmailApi(token);
        if (!isMounted) return;

        setStatus('success');
        setMessage(res.message || 'Your email address has been successfully verified.');
        await refreshUser();
        if (onSuccess) {
          onSuccess();
        }
      } catch (err: any) {
        if (!isMounted) return;
        setStatus('error');
        const errMsg =
          err.response?.data?.message ||
          err.message ||
          'Verification failed. The token may be expired or already used.';
        setMessage(errMsg);
      }
    };

    performVerification();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleResend = async (e: FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim()) {
      setResendStatus({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    try {
      setResending(true);
      setResendStatus(null);
      const res = await resendVerificationEmailApi(resendEmail.trim());
      if (res.delivered === false || res.success === false) {
        setResendStatus({
          type: 'error',
          text: res.message || 'Unable to deliver verification email. SMTP configuration is missing or delivery failed.',
        });
      } else {
        setResendStatus({
          type: 'success',
          text: res.message || 'A fresh verification link has been sent to your email address.',
        });
      }
    } catch (err: any) {
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        'Unable to send verification link right now. Please try again.';
      setResendStatus({ type: 'error', text: errMsg });
    } finally {
      setResending(false);
    }
  };

  const handleGoDashboard = () => {
    if (onNavigateToDashboard) {
      onNavigateToDashboard();
    } else {
      window.location.href = '/';
    }
  };

  const handleGoLogin = () => {
    if (onSwitchToLogin) {
      onSwitchToLogin();
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <div className="card" style={{ maxWidth: '520px', margin: '2rem auto', padding: '2.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 8px 24px rgba(37,99,235,0.25)',
            marginBottom: '1rem',
          }}
        >
          <Mail size={32} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
          Email Verification
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
          SchoolSafe Secure Account Verification
        </p>
      </div>

      {status === 'verifying' && (
        <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
          <Loader2 size={40} className="spin" style={{ color: '#2563eb', margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
            Verifying Link
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>{message}</p>
        </div>
      )}

      {status === 'success' && (
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              boxShadow: '0 0 0 8px #f0fdf4',
            }}
          >
            <CheckCircle2 size={36} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#065f46', marginBottom: '0.5rem' }}>
            Email Verified Successfully!
          </h3>
          <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            {message}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button className="btn btn-primary" onClick={handleGoDashboard} style={{ width: '100%' }}>
              <span>Continue to Dashboard</span>
              <ArrowRight size={18} />
            </button>
            {!user && (
              <button className="btn btn-secondary" onClick={handleGoLogin} style={{ width: '100%' }}>
                Sign In With Your Account
              </button>
            )}
          </div>
        </div>
      )}

      {(status === 'error' || status === 'idle') && (
        <div>
          {status === 'error' && (
            <div
              className="alert alert-danger"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                marginBottom: '1.5rem',
                padding: '1rem',
              }}
            >
              <AlertCircle size={20} style={{ shrink: 0, marginTop: '2px', color: '#dc2626' }} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  Verification Issue
                </strong>
                <span style={{ fontSize: '0.8125rem' }}>{message}</span>
              </div>
            </div>
          )}

          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <ShieldCheck size={20} style={{ color: '#2563eb', shrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.5 }}>
                Verification links are single-use and expire within 24 hours. If your link has expired or
                already been used, you can request a new one below.
              </div>
            </div>
          </div>

          <form onSubmit={handleResend} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label
                htmlFor="resendEmail"
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: '#334155',
                  marginBottom: '0.5rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Account Email
              </label>
              <input
                id="resendEmail"
                type="email"
                required
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                placeholder="e.g. parent@example.com"
                className="input-field"
                style={{ width: '100%' }}
              />
            </div>

            {resendStatus && (
              <div
                className={`alert ${resendStatus.type === 'success' ? 'alert-success' : 'alert-danger'}`}
                style={{ fontSize: '0.8125rem', padding: '0.75rem 1rem' }}
              >
                {resendStatus.text}
              </div>
            )}

            <button
              type="submit"
              disabled={resending}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {resending ? (
                <>
                  <Loader2 size={18} className="spin" />
                  <span>Sending Link...</span>
                </>
              ) : (
                <>
                  <RefreshCw size={18} />
                  <span>Resend Verification Email</span>
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleGoLogin}
              style={{ color: '#2563eb', fontWeight: 600 }}
            >
              ← Back to Sign In
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
