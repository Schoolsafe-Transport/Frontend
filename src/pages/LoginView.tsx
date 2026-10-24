import { useState, useEffect, FC, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { User } from '../types/auth';
import { AlertCircle, ArrowRight, Mail, RefreshCw } from 'lucide-react';
import { resendVerificationEmailApi } from '../services/api';

interface LoginViewProps {
  onSwitchToRegister: () => void;
  onSwitchToForgotPassword: () => void;
  onSwitchToVerifyEmail?: (email?: string) => void;
  onSwitchToVerifyFayda?: () => void;
  onSuccess: (user?: User) => void;
}

export const LoginView: FC<LoginViewProps> = (props) => {
  const { onSwitchToRegister, onSwitchToForgotPassword, onSwitchToVerifyEmail, onSuccess } = props;
  const { login, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [verificationRequirement, setVerificationRequirement] = useState<'EMAIL' | null>(null);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Clear previous auth errors on mount and unmount
  useEffect(() => {
    clearError();
    return () => clearError();
  }, [clearError]);

  // Handle resend countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);
    setVerificationRequirement(null);
    setResendMessage(null);

    if (!email || !password) {
      setLocalError('Please enter both your email address and password.');
      return;
    }

    try {
      setSubmitting(true);
      const user = await login(email, password);
      onSuccess(user);
    } catch (err: any) {
      const code = err.code;
      if (code === 'EMAIL_VERIFICATION_REQUIRED') {
        setVerificationRequirement('EMAIL');
      } else {
        setLocalError(err.message || 'Unable to sign in. Please verify your credentials.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email || resendingEmail || resendCooldown > 0) return;
    try {
      setResendingEmail(true);
      setResendMessage(null);
      const res = await resendVerificationEmailApi(email);
      if (res.delivered === false || res.success === false) {
        setResendMessage({
          type: 'error',
          text: res.message || 'Email delivery failed. SMTP credentials must be configured on the server.',
        });
      } else {
        setResendMessage({
          type: 'success',
          text: res.message || 'Verification link dispatched successfully through configured mail server.',
        });
        setResendCooldown(60);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Unable to resend verification email right now.';
      setResendMessage({
        type: 'error',
        text: msg,
      });
      if (err.response?.status === 429) {
        setResendCooldown(60);
      }
    } finally {
      setResendingEmail(false);
    }
  };

  return (
    <div className="auth-box">
      <div className="auth-header">
        <div className="auth-brand-logo-wrap">
          <img src="/logo-shield.png" alt="SchoolSafe Logo" className="auth-logo-img" />
        </div>
        <h2>Sign In to SchoolSafe</h2>
        <p>Access your school transit tracking, provider dashboard, or administration portal.</p>
      </div>

      {verificationRequirement === 'EMAIL' && (
        <div className="alert alert-warning" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={20} style={{ color: '#d97706', flexShrink: 0 }} />
            <div>
              <strong style={{ display: 'block', fontSize: '0.95rem' }}>Email Verification Required</strong>
              <span style={{ fontSize: '0.85rem' }}>Please verify your email address to continue using SchoolSafe.</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => (onSwitchToVerifyEmail ? onSwitchToVerifyEmail(email) : (window.location.href = '/verify-email'))}
            >
              <Mail size={15} style={{ marginRight: '4px' }} />
              Verify Email Address
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleResendVerification}
              disabled={resendingEmail || resendCooldown > 0}
            >
              <RefreshCw size={14} className={resendingEmail ? 'spin' : ''} style={{ marginRight: '4px' }} />
              {resendingEmail
                ? 'Sending...'
                : resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : 'Resend Verification Link'}
            </button>
          </div>
          {resendMessage && (
            <div style={{ fontSize: '0.8125rem', marginTop: '0.25rem', color: resendMessage.type === 'success' ? '#15803d' : '#b91c1c' }}>
              {resendMessage.text}
            </div>
          )}
        </div>
      )}

      {(localError || error) && !verificationRequirement && (
        <div className="alert alert-danger">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{localError || error}</span>
        </div>
      )}


      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="login-email">Email Address</label>
          <input
            id="login-email"
            className="form-input"
            type="email"
            placeholder="e.g. parent@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label htmlFor="login-password">Password</label>
            <button
              type="button"
              onClick={() => {
                clearError();
                onSwitchToForgotPassword();
              }}
              style={{
                fontSize: '0.825rem',
                color: 'var(--color-accent)',
                fontWeight: 600,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Forgot Password?
            </button>
          </div>
          <input
            id="login-password"
            className="form-input"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={submitting}
          style={{ width: '100%', marginTop: '0.5rem' }}
        >
          {submitting ? 'Signing In...' : 'Sign In'} <ArrowRight size={16} />
        </button>

        <div
          style={{
            textAlign: 'center',
            marginTop: '1.25rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--color-border)',
            fontSize: '0.9rem',
            color: 'var(--color-text-secondary)',
          }}
        >
          Don't have an account yet?{' '}
          <button
            type="button"
            onClick={() => {
              clearError();
              onSwitchToRegister();
            }}
            style={{
              color: 'var(--color-accent)',
              fontWeight: 600,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Create an Account
          </button>
        </div>
      </form>
    </div>
  );
};
