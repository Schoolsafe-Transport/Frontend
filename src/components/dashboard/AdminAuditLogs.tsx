import { useState, useEffect, FC } from 'react';
import { listAuditLogsApi, AuditLog } from '../../services/api';
import { History, Search, Loader2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const AdminAuditLogs: FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listAuditLogsApi({ limit: 100 });
      setLogs(data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load system audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filtered = logs.filter((log) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const actionMatch = log.action.toLowerCase().includes(q);
    const adminMatch = `${log.admin?.firstName} ${log.admin?.lastName} ${log.admin?.email}`.toLowerCase().includes(q);
    const targetMatch = log.targetUser
      ? `${log.targetUser.firstName} ${log.targetUser.lastName} ${log.targetUser.email}`.toLowerCase().includes(q)
      : false;
    const entityMatch = log.entityType.toLowerCase().includes(q);
    return actionMatch || adminMatch || targetMatch || entityMatch;
  });

  return (
    <div className="panel-card" style={{ marginTop: '1.5rem' }}>
      <div className="panel-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={20} style={{ color: 'var(--color-accent)' }} />
            <span>Immutable Platform Audit Logs</span>
            <span
              style={{
                backgroundColor: '#EFF6FF',
                color: 'var(--color-primary)',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.15rem 0.55rem',
                borderRadius: '9999px',
                border: '1px solid #BFDBFE',
              }}
            >
              {logs.length} Recorded Actions
            </span>
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
            Every administrative decision, document approval, account suspension, and payment review is recorded with cryptographic timestamps
          </p>
        </div>

        <div style={{ position: 'relative' }}>
          <Search
            size={14}
            style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }}
          />
          <input
            type="text"
            placeholder="Search by admin, action, target..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '32px', fontSize: '0.8rem', height: '34px', width: '260px' }}
          />
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <Loader2 size={32} className="spin-animation" style={{ color: 'var(--color-primary)', margin: '0 auto' }} />
          <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#64748b' }}>
            Loading audit records...
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#F8FAFC', borderRadius: '12px' }}>
          <CheckCircle2 size={36} style={{ color: 'var(--color-success)', margin: '0 auto 0.5rem' }} />
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary)', margin: '0 0 0.25rem' }}>
            No Audit Records Found
          </h4>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', margin: 0 }}>
            {logs.length === 0
              ? 'No administrative decisions have been recorded yet.'
              : 'No audit records match your search criteria.'}
          </p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Administrator</th>
                <th>Action Performed</th>
                <th>Target User / Entity</th>
                <th>Entity Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#475569' }}>
                      <Clock size={12} style={{ color: '#94a3b8' }} />
                      <span>{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                  </td>
                  <td>
                    <div>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>
                        {log.admin ? `${log.admin.firstName} ${log.admin.lastName}` : 'System Admin'}
                      </strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{log.admin?.email}</div>
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor:
                          log.action.includes('APPROVE')
                            ? '#DCFCE7'
                            : log.action.includes('REJECT') || log.action.includes('SUSPEND')
                            ? '#FEE2E2'
                            : '#EFF6FF',
                        color:
                          log.action.includes('APPROVE')
                            ? '#166534'
                            : log.action.includes('REJECT') || log.action.includes('SUSPEND')
                            ? '#991B1B'
                            : '#1E40AF',
                      }}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td>
                    {log.targetUser ? (
                      <div>
                        <strong style={{ fontSize: '0.825rem' }}>
                          {log.targetUser.firstName} {log.targetUser.lastName}
                        </strong>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{log.targetUser.email}</div>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {log.entityType}: #{log.entityId.slice(0, 8)}
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ fontSize: '0.78rem', color: '#334155', maxWidth: '320px', lineHeight: 1.3 }}>
                      {log.details ? (
                        typeof log.details === 'object' ? (
                          <pre style={{ margin: 0, fontSize: '0.72rem', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                            {JSON.stringify(log.details, null, 1)}
                          </pre>
                        ) : (
                          String(log.details)
                        )
                      ) : (
                        <span style={{ color: '#94a3b8' }}>None</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default AdminAuditLogs;
