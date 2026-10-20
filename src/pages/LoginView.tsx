import { useState, useEffect, FC, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { User } from '../types/auth';
import { AlertCircle, ArrowRight } from 'lucide-react';

interface LoginViewProps {
  onSwitchToRegister: () => void;
  onSwitchToForgotPassword: () => void;
  onSuccess: (user?: User) => void;
}

export const LoginView: FC<LoginViewProps> = ({
  onSwitchToRegister,
  onSwitchToForgotPassword,
  onSuccess,
}) => {
  const { login, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Clear previous auth errors on mount and unmount
  useEffect(() => {
    clearError();
    return () => clearError();
  }, [clearError]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (!email || !password) {
      setLocalError('Please enter both your email address and password.');
      return;
    }

    try {
      setSubmitting(true);
      const user = await login(email, password);
      onSuccess(user);
    } catch (err: any) {
      setLocalError(err.message || 'Unable to sign in. Please verify your credentials.');
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
        <h2>Sign In to SchoolSafe</h2>
        <p>Access your school transit tracking, provider dashboard, or administration portal.</p>
      </div>

      {(localError || error) && (
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
