import { useState, FC, FormEvent } from 'react';
import { forgotPasswordApi, resetPasswordApi } from '../services/api';
import { KeyRound, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';

interface ForgotPasswordViewProps {
  onSwitchToLogin: () => void;
}

export const ForgotPasswordView: FC<ForgotPasswordViewProps> = ({ onSwitchToLogin }) => {
  const [step, setStep] = useState<'REQUEST' | 'RESET' | 'DONE'>('REQUEST');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRequestToken = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      setSubmitting(true);
      const res = await forgotPasswordApi(email);
      setInfoMessage(res.message);
      if (res.resetToken) {
        setToken(res.resetToken);
      }
      setStep('RESET');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to dispatch password reset request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    if (newPassword.length < 8) {
      setErrorMessage('New password must contain at least 8 characters.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await resetPasswordApi(token, newPassword);
      setInfoMessage(res.message);
      setStep('DONE');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Password reset failed. Please check the token.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-box">
      <div className="auth-header">
        <div className="auth-brand-logo-wrap">
          <img src="/logo-shield.png" alt="SchoolSafe Logo" className="auth-logo-img" />
        </div>
        <h2>Reset Password</h2>
        <p>Recover access to your SchoolSafe account safely.</p>
      </div>

      {infoMessage && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <span>{infoMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-danger">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      {step === 'REQUEST' && (
        <form onSubmit={handleRequestToken} className="auth-form">
          <div className="form-group">
            <label htmlFor="forgot-email">Account Email Address</label>
            <input
              id="forgot-email"
              className="form-input"
              type="email"
              placeholder="e.g. parent@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <span className="form-hint">
              We'll send password recovery instructions to this email.
            </span>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={submitting}
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            {submitting ? 'Sending Instructions...' : 'Send Recovery Code'} <ArrowRight size={16} />
          </button>

          <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={onSwitchToLogin}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <ArrowLeft size={14} /> Back to Sign In
            </button>
          </div>
        </form>
      )}

      {step === 'RESET' && (
        <form onSubmit={handleResetPassword} className="auth-form">
          <div className="form-group">
            <label htmlFor="reset-token">Reset Code / Token</label>
            <input
              id="reset-token"
              className="form-input"
              type="text"
              placeholder="Enter recovery code received"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reset-password">New Password</label>
            <input
              id="reset-password"
              className="form-input"
              type="password"
              placeholder="Minimum 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <span className="form-hint">
              Must be at least 8 characters long with letters and numbers.
            </span>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={submitting}
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            {submitting ? 'Updating Password...' : 'Save New Password'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={onSwitchToLogin}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <ArrowLeft size={14} /> Cancel & Return to Sign In
            </button>
          </div>
        </form>
      )}

      {step === 'DONE' && (
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-success-light)',
              color: 'var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}
          >
            <CheckCircle2 size={32} />
          </div>
          <h3 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Password Updated!</h3>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.75rem', fontSize: '0.95rem' }}>
            Your account password has been successfully reset. You can now sign in with your new credentials.
          </p>
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={onSwitchToLogin}
            style={{ width: '100%' }}
          >
            Sign In with New Password
          </button>
        </div>
      )}
    </div>
  );
};
