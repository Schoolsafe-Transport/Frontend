import type { FC } from 'react';
import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  X,
} from 'lucide-react';
import {
  getAdminSafetyIncidentsApi,
  resolveAdminIncidentApi,
} from '../../services/api';
import { StatusBadge } from '../../components/admin/StatusBadge';

export const AdminIncidentsPage: FC<{ onRefreshStats?: () => void }> = ({ onRefreshStats }) => {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'RESOLVED'>('ALL');
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionModalIncident, setResolutionModalIncident] = useState<any | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const data = await getAdminSafetyIncidentsApi(params);
      setIncidents(data || []);
    } catch (err: any) {
      console.error('[AdminIncidents] Error loading incidents:', err);
      setError(err?.response?.data?.message || 'Failed to load safety incidents from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [statusFilter]);

  const handleOpenResolveModal = (incident: any) => {
    setResolutionModalIncident(incident);
    setResolutionNotes('');
  };

  const handleConfirmResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionModalIncident) return;
    if (!resolutionNotes.trim()) {
      alert('Resolution findings and administrative notes are strictly required.');
      return;
    }

    try {
      setResolvingId(resolutionModalIncident.id);
      await resolveAdminIncidentApi(resolutionModalIncident.id, resolutionNotes.trim());
      setToastMessage({
        type: 'success',
        text: `Safety Incident "${resolutionModalIncident.title}" marked as RESOLVED.`,
      });
      setResolutionModalIncident(null);
      await fetchIncidents();
      if (onRefreshStats) onRefreshStats();
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to resolve safety incident.',
      });
    } finally {
      setResolvingId(null);
    }
  };

  const openCount = incidents.filter((i) => i.status === 'OPEN' || i.status === 'UNDER_REVIEW').length;

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

      {/* Main Card */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">
              <AlertTriangle size={20} style={{ color: '#DC2626' }} />
              Platform Safety Incident Command Desk
            </h2>
            <p className="admin-card-desc">
              Immediate safety events, route deviations, and driver alerts logged across transit corridors
            </p>
          </div>

          <button
            className="admin-btn admin-btn-secondary admin-btn-sm"
            onClick={fetchIncidents}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Incidents</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="admin-filter-bar">
          <div className="admin-tabs-group">
            <button
              className={`admin-tab-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setStatusFilter('ALL')}
            >
              All Events ({incidents.length})
            </button>
            <button
              className={`admin-tab-btn ${statusFilter === 'OPEN' ? 'active' : ''}`}
              onClick={() => setStatusFilter('OPEN')}
            >
              Open / Under Review {openCount > 0 && `(${openCount})`}
            </button>
            <button
              className={`admin-tab-btn ${statusFilter === 'RESOLVED' ? 'active' : ''}`}
              onClick={() => setStatusFilter('RESOLVED')}
            >
              Resolved History
            </button>
          </div>
        </div>

        {/* Incident Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
            <Loader2 size={32} className="animate-spin" style={{ color: '#2563EB', margin: '0 auto 0.5rem' }} />
            <p style={{ color: '#64748B', fontSize: '0.875rem' }}>Loading safety incidents from database...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#DC2626' }}>
            <AlertTriangle size={32} style={{ margin: '0 auto 0.5rem' }} />
            <p>{error}</p>
            <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={fetchIncidents} style={{ marginTop: '0.5rem' }}>
              Retry
            </button>
          </div>
        ) : incidents.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon" style={{ backgroundColor: '#ECFDF5', color: '#059669' }}>
              <CheckCircle2 size={26} />
            </div>
            <h4>No Safety Incidents on Record</h4>
            <p style={{ fontSize: '0.85rem' }}>
              All school transportation routes are operational and verified. Zero open safety events logged.
            </p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Severity & Type</th>
                  <th>Title & Description</th>
                  <th>Reporter</th>
                  <th>Route / Vehicle</th>
                  <th>Status</th>
                  <th>Timestamp</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((inc) => (
                  <tr key={inc.id}>
                    <td>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          display: 'inline-block',
                          marginTop: '0.2rem',
                          backgroundColor:
                            inc.severity === 'HIGH' || inc.severity === 'CRITICAL'
                              ? '#FEE2E2'
                              : inc.severity === 'MEDIUM'
                              ? '#FEF3C7'
                              : '#F1F5F9',
                          color:
                            inc.severity === 'HIGH' || inc.severity === 'CRITICAL'
                              ? '#991B1B'
                              : inc.severity === 'MEDIUM'
                              ? '#92400E'
                              : '#334155',
                        }}
                      >
                        {inc.severity || 'MEDIUM'}
                      </span>
                    </td>
                    <td style={{ maxWidth: '320px' }}>
                      <strong style={{ color: '#0F172A', display: 'block', fontSize: '0.875rem' }}>
                        {inc.title}
                      </strong>
                      <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
                        {inc.description}
                      </p>
                      {inc.resolution && (
                        <div style={{ marginTop: '0.35rem', fontSize: '0.75rem', color: '#059669' }}>
                          <strong>Resolution:</strong> {inc.resolution}
                        </div>
                      )}
                    </td>
                    <td>
                      <strong style={{ color: '#334155', fontSize: '0.85rem' }}>
                        {inc.reportedBy?.firstName ? `${inc.reportedBy.firstName} ${inc.reportedBy.lastName}` : 'Reporter'}
                      </strong>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748B' }}>
                        {inc.reportedBy?.role?.replace('_', ' ') || 'User'}
                      </span>
                    </td>
                    <td>
                      <div>
                        {inc.route && (
                          <span style={{ fontWeight: 600, color: '#2563EB', display: 'block', fontSize: '0.825rem' }}>
                            {inc.route.name}
                          </span>
                        )}
                        {inc.vehicle && (
                          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                            Plate: {inc.vehicle.plateNumber}
                          </span>
                        )}
                        {!inc.route && !inc.vehicle && (
                          <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>General Platform</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={inc.status} />
                    </td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem', color: '#64748B' }}>
                      {new Date(inc.createdAt).toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {inc.status !== 'RESOLVED' ? (
                        <button
                          className="admin-btn admin-btn-success admin-btn-sm"
                          disabled={resolvingId === inc.id}
                          onClick={() => handleOpenResolveModal(inc)}
                          title="Record Resolution and Close Incident"
                        >
                          Resolve
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
                          Resolved
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Resolution Notes Modal */}
      {resolutionModalIncident && (
        <div className="admin-modal-overlay" onClick={() => setResolutionModalIncident(null)}>
          <div className="admin-modal" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={20} style={{ color: '#059669' }} />
                <h3 className="admin-modal-title">
                  Resolve Safety Incident: {resolutionModalIncident.title}
                </h3>
              </div>
              <button
                className="admin-btn admin-btn-secondary admin-btn-sm"
                onClick={() => setResolutionModalIncident(null)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleConfirmResolve}>
              <div className="admin-modal-body">
                <div style={{ padding: '0.75rem 1rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '1rem' }}>
                  <strong style={{ display: 'block', fontSize: '0.9rem', color: '#0F172A' }}>
                    {resolutionModalIncident.title}
                  </strong>
                  <span style={{ fontSize: '0.825rem', color: '#64748B' }}>
                    {resolutionModalIncident.description}
                  </span>
                </div>

                <label
                  htmlFor="resolution-notes-input"
                  style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#334155', marginBottom: '0.5rem' }}
                >
                  Resolution Findings & Actions Taken <span style={{ color: '#DC2626' }}>*</span>
                </label>

                <textarea
                  id="resolution-notes-input"
                  rows={4}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Detail administrator findings, driver check-in verification, mechanical inspection, or parental contact..."
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                  autoFocus
                  required
                />
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setResolutionModalIncident(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-success"
                  disabled={resolvingId === resolutionModalIncident.id}
                >
                  {resolvingId === resolutionModalIncident.id ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Saving Resolution...</span>
                    </>
                  ) : (
                    'Confirm & Mark Resolved'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
