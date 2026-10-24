import type { FC } from 'react';
import { useEffect, useState } from 'react';
import {
  Shield,
  Search,
  AlertTriangle,
  Loader2,
  RefreshCw,
  History,
} from 'lucide-react';
import {
  listAuditLogsApi,
  AuditLog,
} from '../../services/api';
import { StatusBadge } from '../../components/admin/StatusBadge';

export const AdminAuditLogsPage: FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listAuditLogsApi({ limit: 100 });
      setLogs(data || []);
    } catch (err: any) {
      console.error('[AdminAuditLogs] Error loading audit logs:', err);
      setError(err?.response?.data?.message || 'Failed to retrieve administrative audit logs from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (actionFilter !== 'ALL' && !log.action.includes(actionFilter)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const adminName = `${log.admin?.firstName || ''} ${log.admin?.lastName || ''}`.toLowerCase();
      const adminEmail = (log.admin?.email || '').toLowerCase();
      const details = (log.details || '').toLowerCase();
      const entity = (log.entityType || '').toLowerCase();
      return (
        adminName.includes(q) ||
        adminEmail.includes(q) ||
        details.includes(q) ||
        entity.includes(q) ||
        log.action.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const actions = [
    { key: 'ALL', label: 'All Operations' },
    { key: 'USER', label: 'User Decisions' },
    { key: 'PAYMENT', label: 'Payment Reviews' },
    { key: 'VEHICLE', label: 'Vehicle Verifications' },
    { key: 'CAMPAIGN', label: 'Campaign Approvals' },
    { key: 'INCIDENT', label: 'Incident Resolutions' },
  ];

  return (
    <div>
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">
              <Shield size={20} style={{ color: '#2563EB' }} />
              Security & Administrative Audit Trail ({filteredLogs.length})
            </h2>
            <p className="admin-card-desc">
              Tamper-evident chronological log of all administrative decisions, status overrides, and document approvals
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search
                size={16}
                style={{ position: 'absolute', left: '12px', top: '11px', color: '#94A3B8' }}
              />
              <input
                type="text"
                className="admin-search-input"
                placeholder="Search admin, action, target..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Action Filter Pills */}
        <div className="admin-filter-bar">
          <div className="admin-tabs-group">
            {actions.map((a) => (
              <button
                key={a.key}
                className={`admin-tab-btn ${actionFilter === a.key ? 'active' : ''}`}
                onClick={() => setActionFilter(a.key)}
              >
                {a.label}
              </button>
            ))}
          </div>

          <button
            className="admin-btn admin-btn-secondary admin-btn-sm"
            onClick={fetchLogs}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Logs</span>
          </button>
        </div>

        {/* Table of Audit Logs */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
            <Loader2 size={32} className="animate-spin" style={{ color: '#2563EB', margin: '0 auto 0.5rem' }} />
            <p style={{ color: '#64748B', fontSize: '0.875rem' }}>Loading audit trail records...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#DC2626' }}>
            <AlertTriangle size={32} style={{ margin: '0 auto 0.5rem' }} />
            <p>{error}</p>
            <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={fetchLogs} style={{ marginTop: '0.5rem' }}>
              Retry
            </button>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">
              <History size={26} />
            </div>
            <h4>No Audit Logs Matching Criteria</h4>
            <p style={{ fontSize: '0.85rem' }}>
              No administrative operations match your search or filter.
            </p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Administrator</th>
                  <th>Action Executed</th>
                  <th>Target Entity</th>
                  <th>Target Subject</th>
                  <th>Details & Reason Recorded</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem', color: '#64748B' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td>
                      <strong style={{ color: '#0F172A', display: 'block' }}>
                        {log.admin ? `${log.admin.firstName} ${log.admin.lastName}` : 'Administrator'}
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        {log.admin?.email}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={log.action} />
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: '#F1F5F9',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          color: '#334155',
                        }}
                      >
                        {log.entityType}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: '#1E293B', fontWeight: 600 }}>
                        {log.targetUser
                          ? `${log.targetUser.firstName} ${log.targetUser.lastName}`
                          : log.entityType}
                      </span>
                      {log.targetUser?.email && (
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748B' }}>
                          {log.targetUser.email}
                        </span>
                      )}
                    </td>
                    <td style={{ maxWidth: '350px' }}>
                      <span style={{ fontSize: '0.825rem', color: '#334155' }}>
                        {log.details || <span style={{ color: '#94A3B8' }}>No extra reason provided</span>}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
