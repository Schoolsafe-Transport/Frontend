import { useState, FC } from 'react';
import { User } from '../../types/auth';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  User as UserIcon,
  Loader2,
  LogOut,
} from 'lucide-react';
import { updateProfileApi, changePasswordApi } from '../../services/api';
import { FaydaVerificationModal } from './FaydaVerificationModal';

interface ProfilePanelProps {
  user: User;
  onUserUpdated?: (updated: User) => void;
}

export const UserProfilePanel: FC<ProfilePanelProps> = ({ user, onUserUpdated }) => {
  const { logout } = useAuth();
  const [isFaydaModalOpen, setIsFaydaModalOpen] = useState(false);

  // Edit Profile State
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [phone, setPhone] = useState(user.phone || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);

    try {
      setProfileLoading(true);
      const updated = await updateProfileApi({
        firstName,
        lastName,
        phone: phone || undefined,
      });
      setProfileSuccess('Profile updated successfully!');
      if (onUserUpdated) onUserUpdated(updated);
    } catch (err: any) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    try {
      setPasswordLoading(true);
      await changePasswordApi(currentPassword, newPassword);
      setPasswordSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Fayda National Digital ID Verification Banner */}
      <div
        className="panel-card"
        style={{
          background: user.isVerified
            ? 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)'
            : 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
          border: user.isVerified ? '1px solid #86EFAC' : '1px solid #93C5FD',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: user.isVerified ? '#22C55E' : '#3B82F6',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={28} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#1E293B' }}>
                  Fayda National Digital ID Status
                </h4>
                {user.isVerified ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#15803D',
                      backgroundColor: '#DCFCE7',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '9999px',
                    }}
                  >
                    <CheckCircle2 size={12} /> Verified Citizen
                  </span>
                ) : (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#D97706',
                      backgroundColor: '#FEF3C7',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '9999px',
                    }}
                  >
                    Unverified
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0.25rem 0 0 0' }}>
                {user.isVerified
                  ? 'Your identity is officially verified with the Ethiopian National ID Authority (Fayda).'
                  : 'Verify your account with Ethiopia’s Fayda National Digital ID to build trusted relationships.'}
              </p>
            </div>
          </div>

          {!user.isVerified && (
            <button
              onClick={() => setIsFaydaModalOpen(true)}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
            >
              <ShieldCheck size={16} /> Verify with Fayda ID
            </button>
          )}
        </div>
      </div>

      <div className="grid-2">
        {/* Personal Details & Edit Profile */}
        <div className="panel-card">
          <div className="panel-header">
            <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserIcon size={18} /> Personal Details
            </h3>
          </div>

          {profileSuccess && (
            <div style={{ padding: '0.75rem', backgroundColor: '#F0FDF4', color: '#15803D', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
              {profileSuccess}
            </div>
          )}
          {profileError && (
            <div style={{ padding: '0.75rem', backgroundColor: '#FEF2F2', color: '#B91C1C', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
              {profileError}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Email Address (Immutable)</label>
              <input
                type="email"
                value={user.email}
                disabled
                style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: '#F8FAFC', color: '#64748B' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Phone Number</label>
              <input
                type="tel"
                value={phone}
                placeholder="+251911223344"
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--color-border)', borderRadius: '8px' }}
              />
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="btn btn-primary"
              style={{ alignSelf: 'flex-start', padding: '0.65rem 1.25rem', marginTop: '0.5rem' }}
            >
              {profileLoading ? <Loader2 size={16} className="spin" /> : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="panel-card">
          <div className="panel-header">
            <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={18} /> Security & Password
            </h3>
          </div>

          {passwordSuccess && (
            <div style={{ padding: '0.75rem', backgroundColor: '#F0FDF4', color: '#15803D', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
              {passwordSuccess}
            </div>
          )}
          {passwordError && (
            <div style={{ padding: '0.75rem', backgroundColor: '#FEF2F2', color: '#B91C1C', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
              {passwordError}
            </div>
          )}

          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Current Password *</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>New Password *</label>
              <input
                type="password"
                placeholder="Min 8 chars, 1 uppercase, 1 number, 1 symbol"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Confirm New Password *</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="btn btn-secondary"
              style={{ alignSelf: 'flex-start', padding: '0.65rem 1.25rem', marginTop: '0.5rem' }}
            >
              {passwordLoading ? <Loader2 size={16} className="spin" /> : 'Update Password'}
            </button>
          </form>
        </div>
      </div>

      {/* 3. Account Session & Sign Out */}
      <div className="panel-card" style={{ padding: '1.5rem', backgroundColor: '#FEF2F2', border: '1.5px solid #FECACA' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#991B1B', fontSize: '1rem' }}>
              <LogOut size={18} />
              <span>Account Session & Sign Out</span>
            </div>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.825rem', color: '#7F1D1D' }}>
              Logged in as <strong>{user.email}</strong> ({user.role.replace(/_/g, ' ')})
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="btn btn-danger"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.25rem',
              fontWeight: 700,
              boxShadow: '0 2px 4px rgba(220, 38, 38, 0.2)',
            }}
          >
            <LogOut size={16} /> Sign Out of SchoolSafe
          </button>
        </div>
      </div>

      <FaydaVerificationModal
        isOpen={isFaydaModalOpen}
        onClose={() => setIsFaydaModalOpen(false)}
        onVerified={() => {
          if (onUserUpdated) onUserUpdated({ ...user, isVerified: true });
        }}
      />
    </div>
  );
};
