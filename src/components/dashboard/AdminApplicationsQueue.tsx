import { useState, useEffect, FC, FormEvent } from 'react';
import {
  getAdminApplicationsApi,
  reviewAdminApplicationApi,
  reviewAccountDocumentApi,
  getAccountDocumentUrl,
  AdminApplication,
} from '../../services/api';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Loader2,
  XCircle,
  FileText,
} from 'lucide-react';

export const AdminApplicationsQueue: FC = () => {
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED'>('PENDING');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Rejection Modal State
  const [rejectingApp, setRejectingApp] = useState<AdminApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingDecision, setSubmittingDecision] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminApplicationsApi();
      setApplications(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load registration applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleApprove = async (app: AdminApplication) => {
    try {
      setSubmittingDecision(true);
      setError(null);
      setSuccessNotice(null);
      await reviewAdminApplicationApi(app.id, 'APPROVE');
      setSuccessNotice(`Successfully approved ${app.firstName} ${app.lastName}'s account.`);
      await loadApplications();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve application.');
    } finally {
      setSubmittingDecision(false);
    }
  };

  const handleSuspend = async (app: AdminApplication) => {
    if (!window.confirm(`Are you sure you want to suspend ${app.firstName} ${app.lastName}'s account?`)) {
      return;
    }
    try {
      setSubmittingDecision(true);
      setError(null);
      await reviewAdminApplicationApi(app.id, 'SUSPEND', 'Account suspended by administrator');
      setSuccessNotice(`Suspended ${app.firstName} ${app.lastName}'s account.`);
      await loadApplications();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to suspend account.');
    } finally {
      setSubmittingDecision(false);
    }
  };

  const handleReviewDocument = async (docId: string, decision: 'APPROVE' | 'REJECT', reason?: string) => {
    try {
      setSubmittingDecision(true);
      setError(null);
      await reviewAccountDocumentApi(docId, { decision, rejectionReason: reason });
      setSuccessNotice(`Document status updated to ${decision}.`);
      await loadApplications();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update document status.');
    } finally {
      setSubmittingDecision(false);
    }
  };

  const openRejectModal = (app: AdminApplication) => {
    setRejectingApp(app);
    setRejectionReason('');
    setModalError(null);
  };

  const handleConfirmReject = async (e: FormEvent) => {
    e.preventDefault();
    if (!rejectingApp) return;

    if (!rejectionReason.trim() || rejectionReason.trim().length < 3) {
      setModalError('Please provide a specific rejection reason of at least 3 characters.');
      return;
    }

    try {
      setSubmittingDecision(true);
      setModalError(null);
      await reviewAdminApplicationApi(rejectingApp.id, 'REJECT', rejectionReason.trim());
      setSuccessNotice(`Application for ${rejectingApp.firstName} ${rejectingApp.lastName} rejected.`);
      setRejectingApp(null);
      await loadApplications();
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Failed to reject application.');
    } finally {
      setSubmittingDecision(false);
    }
  };

  // Filtering
  const filtered = applications.filter((app) => {
    if (statusFilter !== 'ALL' && app.status !== statusFilter) return false;
    if (roleFilter !== 'ALL' && app.role !== roleFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = `${app.firstName} ${app.lastName}`.toLowerCase().includes(q);
      const emailMatch = app.email.toLowerCase().includes(q);
      const phoneMatch = app.phone?.toLowerCase().includes(q);
      const plateMatch = app.vehicles?.some((v) => v.plateNumber.toLowerCase().includes(q));
      if (!nameMatch && !emailMatch && !phoneMatch && !plateMatch) return false;
    }

    return true;
  });

  const pendingCount = applications.filter((a) => a.status === 'PENDING').length;

  return (
    <div className="panel-card" style={{ marginTop: '1.5rem' }}>
      <div className="panel-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Registration Applications & Role Approval Queue</span>
            {pendingCount > 0 && (
              <span
                style={{
                  backgroundColor: '#FEF3C7',
                  color: '#92400E',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '0.15rem 0.55rem',
                  borderRadius: '9999px',
                  border: '1px solid #FCD34D',
                }}
              >
                {pendingCount} Pending Review
              </span>
            )}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
            Inspect identity credentials, email verification status, vehicle documents, and grant role permissions
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={14}
              style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }}
            />
            <input
              type="text"
              placeholder="Search by name, email, plate..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '32px', fontSize: '0.8rem', height: '34px', width: '220px' }}
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input-field"
            style={{ fontSize: '0.8rem', height: '34px', padding: '0 0.5rem' }}
          >
            <option value="ALL">All Roles</option>
            <option value="TRANSPORT_PROVIDER">Transport Providers</option>
            <option value="DRIVER">Drivers</option>
            <option value="BUSINESS">Businesses</option>
          </select>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {(['ALL', 'PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED'] as const).map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}
          >
            {st === 'ALL' && 'All Applications'}
            {st === 'PENDING' && `Pending (${applications.filter((a) => a.status === 'PENDING').length})`}
            {st === 'ACTIVE' && `Approved / Active (${applications.filter((a) => a.status === 'ACTIVE').length})`}
            {st === 'REJECTED' && `Rejected (${applications.filter((a) => a.status === 'REJECTED').length})`}
            {st === 'SUSPENDED' && `Suspended (${applications.filter((a) => a.status === 'SUSPENDED').length})`}
          </button>
        ))}
      </div>

      {successNotice && (
        <div className="alert alert-success" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
          <CheckCircle2 size={16} />
          <span>{successNotice}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <Loader2 size={32} className="spin" style={{ color: 'var(--color-primary)', margin: '0 auto' }} />
          <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#64748b' }}>
            Loading applications queue...
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#f8fafc', borderRadius: '12px' }}>
          <CheckCircle2 size={36} style={{ color: '#10b981', margin: '0 auto 0.5rem auto' }} />
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', margin: '0 0 0.25rem 0' }}>
            No Applications Found
          </h4>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>
            {statusFilter === 'PENDING'
              ? 'All applicant registration queues are cleared. Great job!'
              : 'No applications match your filter criteria.'}
          </p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Role Category</th>
                <th>Email Verification</th>
                <th>Identity (Fayda)</th>
                <th>Vehicle / Asset</th>
                <th>Account Status</th>
                <th>Submission Date</th>
                <th>Admin Decisions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((app) => (
                <tr key={app.id}>
                  <td>
                    <div>
                      <strong>
                        {app.firstName} {app.lastName}
                      </strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{app.email}</div>
                      {app.phone && <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{app.phone}</div>}
                      {app.businessName && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600, marginTop: '0.15rem' }}>
                          🏢 {app.businessName}
                        </div>
                      )}
                      {app.licenseNumber && (
                        <div style={{ fontSize: '0.72rem', color: '#475569' }}>
                          Lic: {app.licenseNumber}
                        </div>
                      )}
                      {app.serviceArea && (
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          Area: {app.serviceArea}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="role-pill" style={{ fontSize: '0.7rem' }}>
                      {app.role === 'TRANSPORT_PROVIDER' && 'Provider'}
                      {app.role === 'DRIVER' && 'Driver'}
                      {app.role === 'BUSINESS' && 'Business'}
                    </span>
                  </td>
                  <td>
                    {app.isEmailVerified ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.75rem',
                          color: '#059669',
                          fontWeight: 700,
                          backgroundColor: '#ecfdf5',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '9999px',
                        }}
                      >
                        <CheckCircle2 size={12} /> Verified
                      </span>
                    ) : (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.75rem',
                          color: '#d97706',
                          fontWeight: 700,
                          backgroundColor: '#fef3c7',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '9999px',
                        }}
                      >
                        <Clock size={12} /> Unverified
                      </span>
                    )}
                  </td>
                  <td>
                    {app.isVerified ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.75rem',
                          color: '#059669',
                          fontWeight: 700,
                          backgroundColor: '#ecfdf5',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '9999px',
                        }}
                      >
                        <ShieldCheck size={12} /> Fayda Verified
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Pending Fayda</span>
                    )}
                  </td>
                  <td>
                    {/* Vehicles */}
                    {app.vehicles && app.vehicles.length > 0 && (
                      <div style={{ marginBottom: '0.5rem' }}>
                        {app.vehicles.map((v) => (
                          <div key={v.id} style={{ fontSize: '0.78rem', marginBottom: '0.2rem' }}>
                            <span style={{ fontWeight: 600 }}>{v.make} {v.model}</span>{' '}
                            <span style={{ color: '#64748b' }}>({v.plateNumber})</span>
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Cap: {v.capacity} seats</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Account Documents */}
                    {app.accountDocuments && app.accountDocuments.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {app.accountDocuments.map((doc) => (
                          <div
                            key={doc.id}
                            style={{
                              padding: '0.35rem 0.5rem',
                              backgroundColor: '#F8FAFC',
                              borderRadius: '6px',
                              border: '1px solid var(--color-border)',
                              fontSize: '0.75rem',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                              <a
                                href={getAccountDocumentUrl(doc.id)}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  fontWeight: 600,
                                  color: 'var(--color-accent)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  textDecoration: 'underline',
                                }}
                              >
                                <FileText size={12} /> {doc.documentName}
                              </a>
                              <span
                                style={{
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  padding: '0.1rem 0.35rem',
                                  borderRadius: '4px',
                                  backgroundColor:
                                    doc.status === 'APPROVED' ? '#DCFCE7' : doc.status === 'REJECTED' ? '#FEE2E2' : '#FEF3C7',
                                  color:
                                    doc.status === 'APPROVED' ? '#166534' : doc.status === 'REJECTED' ? '#991B1B' : '#92400E',
                                }}
                              >
                                {doc.status === 'PENDING_REVIEW' ? 'Pending' : doc.status}
                              </span>
                            </div>
                            {doc.status === 'PENDING_REVIEW' && (
                              <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.25rem' }}>
                                <button
                                  type="button"
                                  onClick={() => handleReviewDocument(doc.id, 'APPROVE')}
                                  disabled={submittingDecision}
                                  className="btn btn-primary btn-sm"
                                  style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem', height: '22px' }}
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const reason = window.prompt('Enter rejection reason for this document:');
                                    if (reason) handleReviewDocument(doc.id, 'REJECT', reason);
                                  }}
                                  disabled={submittingDecision}
                                  className="btn btn-secondary btn-sm"
                                  style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem', height: '22px', color: '#DC2626' }}
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : !app.vehicles || app.vehicles.length === 0 ? (
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>None submitted</span>
                    ) : null}
                  </td>
                  <td>
                    <div>
                      <span
                        className={`badge-status ${
                          app.status === 'ACTIVE'
                            ? 'active'
                            : app.status === 'PENDING'
                            ? 'pending'
                            : 'cancelled'
                        }`}
                        style={{ textTransform: 'capitalize' }}
                      >
                        {app.status.toLowerCase()}
                      </span>
                      {app.rejectionReason && (
                        <div
                          style={{
                            fontSize: '0.7rem',
                            color: '#dc2626',
                            maxWidth: '180px',
                            marginTop: '0.25rem',
                            lineHeight: 1.2,
                          }}
                        >
                          Reason: {app.rejectionReason}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {new Date(app.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {app.status !== 'ACTIVE' && (
                        <button
                          onClick={() => handleApprove(app)}
                          disabled={submittingDecision}
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                        >
                          Approve
                        </button>
                      )}

                      {app.status !== 'REJECTED' && (
                        <button
                          onClick={() => openRejectModal(app)}
                          disabled={submittingDecision}
                          className="btn btn-secondary btn-sm"
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.6rem',
                            color: '#b91c1c',
                            borderColor: '#fca5a5',
                          }}
                        >
                          Reject
                        </button>
                      )}

                      {app.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleSuspend(app)}
                          disabled={submittingDecision}
                          className="btn btn-secondary btn-sm"
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.6rem',
                            color: '#d97706',
                          }}
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

      {/* Rejection Reason Modal */}
      {rejectingApp && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: '#FEE2E2',
                  color: '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <XCircle size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Reject Registration Application
                </h4>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>
                  {rejectingApp.firstName} {rejectingApp.lastName} ({rejectingApp.email})
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmReject} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label
                  htmlFor="rejectionReason"
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color: '#334155',
                    marginBottom: '0.35rem',
                  }}
                >
                  Mandatory Rejection Reason *
                </label>
                <textarea
                  id="rejectionReason"
                  rows={4}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Commercial driver license expired or vehicle inspection document is illegible."
                  className="input-field"
                  style={{ width: '100%', resize: 'vertical' }}
                />
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  This reason will be recorded in the audit trail and emailed to the applicant.
                </span>
              </div>

              {modalError && (
                <div className="alert alert-danger" style={{ fontSize: '0.8125rem', padding: '0.5rem 0.75rem' }}>
                  {modalError}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  disabled={submittingDecision}
                  onClick={() => setRejectingApp(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDecision}
                  className="btn btn-primary"
                  style={{ backgroundColor: '#DC2626', borderColor: '#DC2626' }}
                >
                  {submittingDecision ? 'Submitting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
