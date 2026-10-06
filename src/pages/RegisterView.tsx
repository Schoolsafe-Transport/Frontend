import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/auth';

interface RegisterViewProps {
  onSwitchToLogin: () => void;
  onSuccess: () => void;
}

const ROLES_OPTIONS: { role: UserRole; label: string; icon: string }[] = [
  { role: 'PARENT', label: 'Parent / Guardian', icon: '👨‍👩‍👧' },
  { role: 'STUDENT', label: 'Student', icon: '🎒' },
  { role: 'SCHOOL_ADMIN', label: 'School Administrator', icon: '🏫' },
  { role: 'TRANSPORT_PROVIDER', label: 'Transport Provider / Vehicle Owner', icon: '🚐' },
  { role: 'DRIVER', label: 'Vehicle Driver', icon: '🪪' },
  { role: 'BUSINESS', label: 'Business / Advertiser', icon: '📢' },
  { role: 'ADMIN', label: 'Platform Administrator', icon: '🛡️' },
  { role: 'SUPER_ADMIN', label: 'Super Administrator', icon: '⚡' },
];

export const RegisterView: React.FC<RegisterViewProps> = ({
  onSwitchToLogin,
  onSuccess,
}) => {
  const { register, error, clearError } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('PARENT');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (password.length < 8) {
      setLocalError('Password must contain at least 8 characters.');
      return;
    }

    try {
      setSubmitting(true);
      await register({
        firstName,
        lastName,
        email,
        phone: phone || undefined,
        password,
        role,
      });
      onSuccess();
    } catch (err: any) {
      setLocalError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <div className="auth-badge">JOIN SCHOOLSAFE</div>
        <h2>Create an Account</h2>
        <p>Register as a parent, driver, provider, school admin, or advertiser.</p>
      </div>

      {(localError || error) && (
        <div className="alert alert-danger">
          <span>⚠️</span> {localError || error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label htmlFor="reg-first-name">First Name</label>
            <input
              id="reg-first-name"
              type="text"
              placeholder="e.g. Sara"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-last-name">Last Name</label>
            <input
              id="reg-last-name"
              type="text"
              placeholder="e.g. Bekele"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="reg-email">Email Address</label>
          <input
            id="reg-email"
            type="email"
            placeholder="e.g. sara@schoolsafe.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="reg-phone">Phone Number (Optional)</label>
          <input
            id="reg-phone"
            type="tel"
            placeholder="e.g. +251911223344"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="reg-role">Platform Role</label>
          <select
            id="reg-role"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="select-input"
          >
            {ROLES_OPTIONS.map((item) => (
              <option key={item.role} value={item.role}>
                {item.icon} {item.label} ({item.role})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="reg-password">Password</label>
          <input
            id="reg-password"
            type="password"
            placeholder="Minimum 8 chars, 1 uppercase, 1 symbol, 1 digit"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          <small style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginTop: '4px' }}>
            Must contain at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special symbol.
          </small>
        </div>

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Creating Account...' : 'Complete Registration'}
        </button>

        <div className="auth-footer">
          <span>Already have an account?</span>{' '}
          <button type="button" className="link-btn" onClick={onSwitchToLogin}>
            Sign In Here
          </button>
        </div>
      </form>
    </div>
  );
};
