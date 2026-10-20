import { useState, FC, ReactNode, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole, User } from '../types/auth';
import { Users, Bus, Building2, AlertCircle, ArrowLeft, Check } from 'lucide-react';

interface RegisterViewProps {
  initialRole?: UserRole;
  onSwitchToLogin: () => void;
  onSuccess: (user?: User) => void;
}

interface RoleChoice {
  role: UserRole;
  label: string;
  description: string;
  icon: ReactNode;
}

const PUBLIC_ROLES: RoleChoice[] = [
  {
    role: 'PARENT',
    label: 'Parent / Guardian',
    description: 'Find verified school routes, request seats, and track children safely.',
    icon: <Users size={20} />,
  },
  {
    role: 'TRANSPORT_PROVIDER',
    label: 'Transport Provider / Driver',
    description: 'Register vehicles, define routes, manage seat bookings, and conduct daily trips.',
    icon: <Bus size={20} />,
  },
  {
    role: 'BUSINESS',
    label: 'Business / Advertiser',
    description: 'Advertise automotive, insurance, or family services to school communities.',
    icon: <Building2 size={20} />,
  },
];

export const RegisterView: FC<RegisterViewProps> = ({
  initialRole = 'PARENT',
  onSwitchToLogin,
  onSuccess,
}) => {
  const { register, error, clearError } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>(initialRole);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();

    if (trimmedFirst.length < 2) {
      setLocalError('First name must be at least 2 characters.');
      return;
    }

    if (trimmedLast.length < 2) {
      setLocalError('Last name must be at least 2 characters.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setLocalError('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setLocalError('Password must contain at least 8 characters.');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setLocalError('Password must contain at least 1 uppercase letter.');
      return;
    }
    if (!/[a-z]/.test(password)) {
      setLocalError('Password must contain at least 1 lowercase letter.');
      return;
    }
    if (!/[0-9]/.test(password)) {
      setLocalError('Password must contain at least 1 number.');
      return;
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      setLocalError('Password must contain at least 1 special character (e.g. !@#$%^&*).');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match. Please verify your password confirmation.');
      return;
    }

    try {
      setSubmitting(true);
      const newUser = await register({
        firstName: trimmedFirst,
        lastName: trimmedLast,
        email: trimmedEmail,
        phone: trimmedPhone || undefined,
        password,
        role,
      });
      onSuccess(newUser);
    } catch (err: any) {
      setLocalError(err.message || 'Registration failed. Please check your details.');
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
        <h2>Create an Account</h2>
        <p>Join SchoolSafe for trusted, verified school transportation management.</p>
      </div>

      {(localError || error) && (
        <div className="alert alert-danger">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{localError || error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        {/* Role Selection Segment */}
        <div className="form-group">
          <label style={{ marginBottom: '0.4rem' }}>Select Your Account Type</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.65rem' }}>
            {PUBLIC_ROLES.map((r) => {
              const isSelected = role === r.role;
              return (
                <div
                  key={r.role}
                  onClick={() => setRole(r.role)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    backgroundColor: isSelected ? 'var(--color-accent-light)' : 'var(--color-surface)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: isSelected ? 'var(--color-accent)' : '#F1F5F9',
                      color: isSelected ? '#FFFFFF' : 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {r.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.925rem', color: isSelected ? 'var(--color-primary)' : 'var(--color-text-main)' }}>
                      {r.label}
                    </div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--color-text-secondary)', lineHeight: 1.3 }}>
                      {r.description}
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="role-selector"
                    checked={isSelected}
                    onChange={() => setRole(r.role)}
                    style={{ accentColor: 'var(--color-accent)' }}
                  />
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            * Students are securely linked under Parent accounts. Admin accounts are provisioned separately.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
          <div className="form-group">
            <label htmlFor="reg-first-name">First Name</label>
            <input
              id="reg-first-name"
              className="form-input"
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
              className="form-input"
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
            className="form-input"
            type="email"
            placeholder="e.g. sara@example.com"
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
            className="form-input"
            type="tel"
            placeholder="e.g. +251 91 123 4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="reg-password">Password</label>
          <input
            id="reg-password"
            className="form-input"
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          <span className="form-hint" style={{ marginBottom: '0.4rem', display: 'block' }}>
            Must satisfy all security requirements below:
          </span>
          {/* Password criteria checklist */}
          <div
            style={{
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              fontSize: '0.78rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.3rem',
            }}
          >
            {[
              { label: 'At least 8 characters', met: password.length >= 8 },
              { label: 'At least 1 uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
              { label: 'At least 1 lowercase letter (a-z)', met: /[a-z]/.test(password) },
              { label: 'At least 1 number (0-9)', met: /[0-9]/.test(password) },
              { label: 'At least 1 special character (!@#$%^&*)', met: /[^A-Za-z0-9]/.test(password) },
            ].map((rule, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  color: rule.met ? '#16A34A' : password.length > 0 ? '#DC2626' : '#64748B',
                  fontWeight: rule.met ? 600 : 400,
                  transition: 'color 0.15s ease',
                }}
              >
                {rule.met ? (
                  <Check size={14} style={{ flexShrink: 0, color: '#16A34A' }} />
                ) : (
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: password.length > 0 ? '#DC2626' : '#94A3B8',
                      display: 'inline-block',
                      marginLeft: '4px',
                      marginRight: '4px',
                      flexShrink: 0,
                    }}
                  />
                )}
                <span>{rule.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="reg-confirm-password">Confirm Password</label>
          <input
            id="reg-confirm-password"
            className="form-input"
            type="password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          {confirmPassword && password !== confirmPassword && (
            <span style={{ color: 'var(--color-danger, #ef4444)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
              Passwords do not match
            </span>
          )}
        </div>

        <button type="submit" className="btn btn-primary btn-lg" disabled={submitting} style={{ width: '100%', marginTop: '0.5rem' }}>
          {submitting ? 'Creating Account...' : 'Get Started'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            style={{ color: 'var(--color-accent)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Sign In
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '0.25rem' }}>
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="btn btn-ghost btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <ArrowLeft size={14} /> Back to Sign In
          </button>
        </div>
      </form>
    </div>
  );
};
