import type { FC } from 'react';
import { useEffect, useState } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Eye,
  X,
} from 'lucide-react';
import {
  getAdminUsersApi,
  updateAdminUserStatusApi,
  AdminUserRecord,
} from '../../services/api';
import { StatusBadge } from '../../components/admin/StatusBadge';

export const AdminUsersPage: FC = () => {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Selected user for details modal
  const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {
        page,
        limit: 15,
      };
      if (search.trim()) params.search = search.trim();
      if (roleFilter !== 'ALL') params.role = roleFilter;
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const res = await getAdminUsersApi(params);
      setUsers(res.users || []);
      setTotalPages(res.totalPages || 1);
      setTotalCount(res.total || 0);
    } catch (err: any) {
      console.error('[AdminUsers] Error loading users:', err);
      setError(err?.response?.data?.message || 'Failed to load users from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleStatusChange = async (userId: string, newStatus: 'ACTIVE' | 'SUSPENDED' | 'REJECTED') => {
    const confirmMessage =
      newStatus === 'ACTIVE'
        ? 'Are you sure you want to activate/approve this user account?'
        : newStatus === 'SUSPENDED'
        ? 'Are you sure you want to suspend this user? They will be locked out of the platform.'
        : 'Are you sure you want to reject this account?';

    if (!window.confirm(confirmMessage)) return;

    try {
      setActionLoadingId(userId);
      await updateAdminUserStatusApi(userId, newStatus);
      setToastMessage({
        type: 'success',
        text: `User account status successfully updated to ${newStatus}.`,
      });
      // Refresh list
      await fetchUsers();
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to update user status.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const roles = [
    { key: 'ALL', label: 'All Roles' },
    { key: 'PARENT', label: 'Parents' },
    { key: 'TRANSPORT_PROVIDER', label: 'Providers' },
    { key: 'DRIVER', label: 'Drivers' },
    { key: 'BUSINESS', label: 'Businesses' },
    { key: 'ADMIN', label: 'Administrators' },
  ];

  const statuses = [
    { key: 'ALL', label: 'All Statuses' },
    { key: 'ACTIVE', label: 'Active' },
    { key: 'PENDING', label: 'Pending' },
    { key: 'SUSPENDED', label: 'Suspended' },
    { key: 'REJECTED', label: 'Rejected' },
  ];

  return (
    <div>
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="admin-toast-container">
          <div className={`admin-toast ${toastMessage.type === 'success' ? 'admin-toast-success' : 'admin-toast-error'}`}>
            {toastMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span>{toastMessage.text}</span>
            <button
              style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', marginLeft: 'auto' }}
              onClick={() => setToastMessage(null)}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Header and Controls */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">
              <Users size={20} style={{ color: '#2563EB' }} />
              Platform Registered Users ({totalCount})
            </h2>
            <p className="admin-card-desc">
              Manage all system accounts, enforce status access, and review verified credentials
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search
                size={16}
                style={{ position: 'absolute', left: '12px', top: '11px', color: '#94A3B8' }}
              />
              <input
                type="text"
                className="admin-search-input"
                placeholder="Search name, email, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="admin-btn admin-btn-secondary admin-btn-sm">
              Search
            </button>
          </form>
        </div>

        {/* Filter Pills */}
        <div className="admin-filter-bar">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            {/* Roles */}
            <div className="admin-tabs-group">
              {roles.map((r) => (
                <button
                  key={r.key}
                  className={`admin-tab-btn ${roleFilter === r.key ? 'active' : ''}`}
                  onClick={() => {
                    setRoleFilter(r.key);
                    setPage(1);
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Statuses */}
            <div className="admin-tabs-group">
              {statuses.map((s) => (
                <button
                  key={s.key}
                  className={`admin-tab-btn ${statusFilter === s.key ? 'active' : ''}`}
                  onClick={() => {
                    setStatusFilter(s.key);
                    setPage(1);
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <button
            className="admin-btn admin-btn-secondary admin-btn-sm"
            onClick={fetchUsers}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Users Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <Loader2 size={32} className="animate-spin" style={{ color: '#2563EB', margin: '0 auto 0.5rem' }} />
            <p style={{ color: '#64748B', fontSize: '0.875rem' }}>Loading users from database...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#DC2626' }}>
            <AlertTriangle size={32} style={{ margin: '0 auto 0.5rem' }} />
            <p>{error}</p>
            <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={fetchUsers} style={{ marginTop: '0.5rem' }}>
              Retry
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">
              <Users size={26} />
            </div>
            <h4>No Users Found</h4>
            <p style={{ fontSize: '0.85rem' }}>
              No user accounts in the database match your selected role and status filters.
            </p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Verification</th>
                  <th>Registered</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            backgroundColor: '#EFF6FF',
                            color: '#1D4ED8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                          }}
                        >
                          {u.firstName?.[0] || 'U'}
                          {u.lastName?.[0] || ''}
                        </div>
                        <div>
                          <strong style={{ color: '#0F172A', display: 'block' }}>
                            {u.firstName} {u.lastName}
                          </strong>
                          <span style={{ fontSize: '0.775rem', color: '#64748B' }}>
                            {u.email} {u.phone ? `• ${u.phone}` : ''}
                          </span>
                          {u.businessName && (
                            <span style={{ display: 'block', fontSize: '0.75rem', color: '#2563EB', fontWeight: 600 }}>
                              {u.businessName}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.55rem',
                          borderRadius: '6px',
                          backgroundColor: '#F1F5F9',
                          color: '#334155',
                          textTransform: 'uppercase',
                        }}
                      >
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={u.status} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <StatusBadge status={u.isVerified} type="verification" />
                        <span style={{ fontSize: '0.72rem', color: u.isEmailVerified ? '#059669' : '#D97706' }}>
                          {u.isEmailVerified ? '✓ Email Verified' : '○ Email Pending'}
                        </span>
                      </div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem', color: '#64748B' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                          onClick={() => setSelectedUser(u)}
                          title="View Full Profile Details"
                        >
                          <Eye size={13} /> Details
                        </button>

                        {u.status !== 'ACTIVE' && (
                          <button
                            className="admin-btn admin-btn-success admin-btn-sm"
                            disabled={actionLoadingId === u.id}
                            onClick={() => handleStatusChange(u.id, 'ACTIVE')}
                            title="Activate / Approve User Account"
                          >
                            Activate
                          </button>
                        )}

                        {u.status === 'ACTIVE' && (
                          <button
                            className="admin-btn admin-btn-danger admin-btn-sm"
                            disabled={actionLoadingId === u.id}
                            onClick={() => handleStatusChange(u.id, 'SUSPENDED')}
                            title="Suspend User Account"
                          >
                            Suspend
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '1.25rem',
              paddingTop: '1rem',
              borderTop: '1px solid #F1F5F9',
            }}
          >
            <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
              Page {page} of {totalPages} ({totalCount} total users)
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="admin-btn admin-btn-secondary admin-btn-sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
              <button
                className="admin-btn admin-btn-secondary admin-btn-sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="admin-modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3 className="admin-modal-title">
                  User Details • {selectedUser.firstName} {selectedUser.lastName}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>{selectedUser.email}</span>
              </div>
              <button
                className="admin-btn admin-btn-secondary admin-btn-sm"
                onClick={() => setSelectedUser(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ padding: '0.85rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Email Address</span>
                  <strong style={{ fontSize: '0.9rem', color: '#0F172A' }}>{selectedUser.email}</strong>
                </div>

                <div style={{ padding: '0.85rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Phone Number</span>
                  <strong style={{ fontSize: '0.9rem', color: '#0F172A' }}>{selectedUser.phone || 'Not provided'}</strong>
                </div>

                <div style={{ padding: '0.85rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Assigned Platform Role</span>
                  <strong style={{ fontSize: '0.9rem', color: '#2563EB' }}>{selectedUser.role.replace('_', ' ')}</strong>
                </div>

                <div style={{ padding: '0.85rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Current Status</span>
                  <div style={{ marginTop: '0.2rem' }}>
                    <StatusBadge status={selectedUser.status} />
                  </div>
                </div>
              </div>

              {selectedUser.businessName && (
                <div
                  style={{
                    padding: '1rem',
                    backgroundColor: '#EFF6FF',
                    borderRadius: '8px',
                    border: '1px solid #BFDBFE',
                    marginBottom: '1rem',
                  }}
                >
                  <strong style={{ color: '#1E40AF', display: 'block', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                    Commercial / Business Registration
                  </strong>
                  <div style={{ fontSize: '0.85rem', color: '#1E3A8A' }}>
                    Business: <strong>{selectedUser.businessName}</strong>
                    {selectedUser.licenseNumber && ` • License: ${selectedUser.licenseNumber}`}
                    {selectedUser.serviceArea && ` • Service Zone: ${selectedUser.serviceArea}`}
                  </div>
                </div>
              )}

              <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                Account created on: {new Date(selectedUser.createdAt).toLocaleString()}
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                className="admin-btn admin-btn-secondary"
                onClick={() => setSelectedUser(null)}
              >
                Close
              </button>

              {selectedUser.status !== 'ACTIVE' && (
                <button
                  className="admin-btn admin-btn-success"
                  onClick={() => handleStatusChange(selectedUser.id, 'ACTIVE')}
                  disabled={actionLoadingId === selectedUser.id}
                >
                  Activate Account
                </button>
              )}

              {selectedUser.status === 'ACTIVE' && (
                <button
                  className="admin-btn admin-btn-danger"
                  onClick={() => handleStatusChange(selectedUser.id, 'SUSPENDED')}
                  disabled={actionLoadingId === selectedUser.id}
                >
                  Suspend Account
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
