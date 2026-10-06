import React, { useState } from 'react';
import { forgotPasswordApi, resetPasswordApi } from '../services/api';

interface ForgotPasswordViewProps {
  onSwitchToLogin: () => void;
}

export const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({ onSwitchToLogin }) => {
  const [step, setStep] = useState<'REQUEST' | 'RESET' | 'DONE'>('REQUEST');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      setSubmitting(true);
      const res = await forgotPasswordApi(email);
      setInfoMessage(res.message);
      if (res.resetToken) {
        setToken(res.resetToken);
        setInfoMessage(
          `${res.message} [Dev Mode: Token auto-filled below for testing: ${res.resetToken}]`
        );
      }
      setStep('RESET');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to dispatch reset request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      setSubmitting(true);
      const res = await resetPasswordApi(token, newPassword);
      setInfoMessage(res.message);
      setStep('DONE');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Password reset failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <div className="auth-badge">SECURITY RECOVERY</div>
        <h2>Reset Your Password</h2>
        <p>Recover access to your SchoolSafe account securely.</p>
      </div>

      {infoMessage && (
        <div className="alert alert-success">
          <span>ℹ️</span> {infoMessage}
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-danger">
          <span>⚠️</span> {errorMessage}
        </div>
      )}

      {step === 'REQUEST' && (
        <form onSubmit={handleRequestToken} className="auth-form">
          <div className="form-group">
            <label htmlFor="forgot-email">Account Email Address</label>
            <input
              id="forgot-email"
              type="email"
              placeholder="e.g. parent@schoolsafe.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Dispatching Token...' : 'Send Reset Instructions'}
          </button>

          <div className="auth-footer">
            <button type="button" className="link-btn" onClick={onSwitchToLogin}>
              ← Back to Sign In
            </button>
          </div>
        </form>
      )}

      {step === 'RESET' && (
        <form onSubmit={handleResetPassword} className="auth-form">
          <div className="form-group">
            <label htmlFor="reset-token">Reset Token</label>
            <input
              id="reset-token"
              type="text"
              placeholder="Enter received reset token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reset-password">New Password</label>
            <input
              id="reset-password"
              type="password"
              placeholder="Minimum 8 chars, 1 uppercase, 1 symbol, 1 digit"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Updating Password...' : 'Save New Password'}
          </button>

          <div className="auth-footer">
            <button type="button" className="link-btn" onClick={onSwitchToLogin}>
              ← Back to Sign In
            </button>
          </div>
        </form>
      )}

      {step === 'DONE' && (
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <p style={{ color: 'var(--success)', marginBottom: '1.5rem', fontWeight: 600 }}>
            🎉 Your password has been successfully updated!
          </p>
          <button type="button" className="btn btn-primary" onClick={onSwitchToLogin}>
            Sign In with New Password
          </button>
        </div>
      )}
    </div>
  );
};
