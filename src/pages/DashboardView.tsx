import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { testAdminRoute, testSchoolRoute, testProviderRoute } from '../services/api';

export const DashboardView: React.FC = () => {
  const { user, logout } = useAuth();
  const [rbacTestResult, setRbacTestResult] = useState<{
    route: string;
    status: number;
    message: string;
    isError: boolean;
  } | null>(null);
  const [testing, setTesting] = useState(false);

  if (!user) return null;

  const runRbacTest = async (
    name: string,
    apiFn: () => Promise<any>
  ) => {
    try {
      setTesting(true);
      setRbacTestResult(null);
      const res = await apiFn();
      setRbacTestResult({
        route: name,
        status: 200,
        message: res.message || 'Access granted!',
        isError: false,
      });
    } catch (err: any) {
      setRbacTestResult({
        route: name,
        status: err.response?.status || 500,
        message: err.response?.data?.message || err.message,
        isError: true,
      });
    } finally {
      setTesting(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return '#f43f5e';
      case 'SCHOOL_ADMIN':
        return '#8b5cf6';
      case 'TRANSPORT_PROVIDER':
        return '#f59e0b';
      case 'DRIVER':
        return '#06b6d4';
      case 'BUSINESS':
        return '#ec4899';
      default:
        return '#38bdf8';
    }
  };

  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <div className="profile-banner">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.firstName[0]}
            {user.lastName[0]}
          </div>
          <div>
            <h2>
              Welcome back, {user.firstName} {user.lastName}!
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.4rem' }}>
              <span
                className="role-badge"
                style={{ backgroundColor: `${getRoleBadgeColor(user.role)}22`, color: getRoleBadgeColor(user.role), borderColor: `${getRoleBadgeColor(user.role)}55` }}
              >
                ● {user.role}
              </span>
              <span className="status-badge">
                Status: {user.status}
              </span>
              {user.isVerified && <span className="verified-badge">✓ Verified</span>}
            </div>
          </div>
        </div>

        <button onClick={logout} className="btn btn-outline" style={{ alignSelf: 'flex-start' }}>
          Sign Out
        </button>
      </div>

      {/* Account Details Card */}
      <div className="grid" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>User Profile & Identity</h3>
          <div className="info-row">
            <span className="info-label">Email:</span>
            <span className="info-value">{user.email}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Phone:</span>
            <span className="info-value">{user.phone || 'Not provided'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">User ID:</span>
            <span className="info-value" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{user.id}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Member Since:</span>
            <span className="info-value">{new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>Session & Security Token</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Authenticated via JSON Web Token (JWT) with automatic background token rotation. Passwords are never stored in plain text.
          </p>
          <div className="security-check-item">
            <span>🛡️ Password Encrypted:</span>
            <span style={{ color: 'var(--success)' }}>bcrypt (Cost 12)</span>
          </div>
          <div className="security-check-item">
            <span>🔑 Active Token Expiration:</span>
            <span>15 Minutes</span>
          </div>
          <div className="security-check-item">
            <span>🔄 Refresh Token Rotation:</span>
            <span style={{ color: 'var(--success)' }}>Active</span>
          </div>
        </div>
      </div>

      {/* Interactive RBAC Verification Panel */}
      <div className="card rbac-panel">
        <h3 className="card-title">Live Role-Based Access Control (RBAC) Tester</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          Test backend protected endpoints using your current session (Role: <strong>{user.role}</strong>). The server will enforce authorization and return either HTTP 200 or HTTP 403 Forbidden.
        </p>

        <div className="rbac-buttons">
          <button
            className="btn btn-secondary"
            onClick={() => runRbacTest('GET /api/auth/admin-only', testAdminRoute)}
            disabled={testing}
          >
            Test Admin Route (Admin / Super Admin)
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => runRbacTest('GET /api/auth/school-only', testSchoolRoute)}
            disabled={testing}
          >
            Test School Route (School Admin)
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => runRbacTest('GET /api/auth/provider-only', testProviderRoute)}
            disabled={testing}
          >
            Test Provider Route (Transport Provider)
          </button>
        </div>

        {rbacTestResult && (
          <div
            className={`alert ${rbacTestResult.isError ? 'alert-danger' : 'alert-success'}`}
            style={{ marginTop: '1.25rem' }}
          >
            <div>
              <strong>{rbacTestResult.route}</strong> • HTTP {rbacTestResult.status}
            </div>
            <div style={{ marginTop: '0.35rem' }}>{rbacTestResult.message}</div>
          </div>
        )}
      </div>
    </div>
  );
};
