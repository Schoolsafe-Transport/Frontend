import type { FC } from 'react';
import { useEffect, useState } from 'react';
import {
  UserCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Eye,
  FileText,
  X,
  ExternalLink,
} from 'lucide-react';
import {
  getAdminApplicationsApi,
  reviewAdminApplicationApi,
  reviewAccountDocumentApi,
  getAccountDocumentUrl,
  AdminApplication,
} from '../../services/api';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { RejectionModal } from '../../components/admin/RejectionModal';

export const AdminProvidersPage: FC<{ onRefreshStats?: () => void }> = ({ onRefreshStats }) => {
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'REJECTED'>('PENDING');

  // Detail Modal
  const [selectedApp, setSelectedApp] = useState<AdminApplication | null>(null);

  // Document Preview Modal
  const [previewingDoc, setPreviewingDoc] = useState<any | null>(null);

  // Rejection Modal
  const [rejectionTarget, setRejectionTarget] = useState<AdminApplication | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {
        role: 'TRANSPORT_PROVIDER',
      };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const data = await getAdminApplicationsApi(params);
      setApplications(data || []);
    } catch (err: any) {
      console.error('[AdminProviders] Error loading applications:', err);
      setError(err?.response?.data?.message || 'Failed to retrieve provider applications from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchApplications();
  };

  const handleApprove = async (app: AdminApplication) => {
    try {
      setActionLoadingId(app.id);
      await reviewAdminApplicationApi(app.id, 'APPROVE');
      setToastMessage({
        type: 'success',
        text: `Application for ${app.firstName} ${app.lastName} successfully APPROVED.`,
      });
      await fetchApplications();
      if (onRefreshStats) onRefreshStats();
      if (selectedApp && selectedApp.id === app.id) {
        setSelectedApp((prev) => (prev ? { ...prev, status: 'ACTIVE' } : null));
      }
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to approve application.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmRejection = async (reason: string) => {
    if (!rejectionTarget) return;

    try {
      setActionLoadingId(rejectionTarget.id);
      await reviewAdminApplicationApi(rejectionTarget.id, 'REJECT', reason);
      setToastMessage({
        type: 'success',
        text: `Application for ${rejectionTarget.firstName} ${rejectionTarget.lastName} has been REJECTED. Reason recorded.`,
      });
      setRejectionTarget(null);
      await fetchApplications();
      if (onRefreshStats) onRefreshStats();
      if (selectedApp && selectedApp.id === rejectionTarget.id) {
        setSelectedApp((prev) => (prev ? { ...prev, status: 'REJECTED', rejectionReason: reason } : null));
      }
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to record application rejection.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReviewDocument = async (documentId: string, decision: 'APPROVE' | 'REJECT') => {
    let reason: string | undefined;
    if (decision === 'REJECT') {
      const input = prompt('Enter a rejection reason for this document:');
      if (!input || !input.trim()) return;
      reason = input.trim();
    }

    try {
      await reviewAccountDocumentApi(documentId, { decision, rejectionReason: reason });
      setToastMessage({
        type: 'success',
        text: `Document successfully marked as ${decision}.`,
      });
      await fetchApplications();
      if (selectedApp) {
        const updated = await getAdminApplicationsApi({ role: 'TRANSPORT_PROVIDER', search: selectedApp.email });
        const refreshed = updated.find((a) => a.id === selectedApp.id);
        if (refreshed) setSelectedApp(refreshed);
      }
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to update document status.',
      });
    }
  };

  const pendingCount = applications.filter((a) => a.status === 'PENDING').length;

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

      {/* Rejection Reason Modal */}
      <RejectionModal
        isOpen={Boolean(rejectionTarget)}
        title="Reject Provider Application"
        itemDescription={
          rejectionTarget
            ? `${rejectionTarget.businessName || `${rejectionTarget.firstName} ${rejectionTarget.lastName}`} (${rejectionTarget.email})`
            : undefined
        }
        placeholder="State specific deficiency (e.g. invalid commercial permit, expired driver license, unverified service area)..."
        onClose={() => setRejectionTarget(null)}
        onConfirm={handleConfirmRejection}
      />

      {/* Main Card */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">
              <UserCheck size={20} style={{ color: '#2563EB' }} />
              Transport Provider Applications & Approvals
            </h2>
            <p className="admin-card-desc">
              Review operator licenses, verify commercial transit documentation, and approve eligible providers
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
                placeholder="Search business, name, license..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="admin-btn admin-btn-secondary admin-btn-sm">
              Search
            </button>
          </form>
        </div>

        {/* Filter Bar */}
        <div className="admin-filter-bar">
          <div className="admin-tabs-group">
            <button
              className={`admin-tab-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setStatusFilter('ALL')}
            >
              All Providers
            </button>
            <button
              className={`admin-tab-btn ${statusFilter === 'PENDING' ? 'active' : ''}`}
              onClick={() => setStatusFilter('PENDING')}
            >
              Pending Review {pendingCount > 0 && `(${pendingCount})`}
            </button>
            <button
              className={`admin-tab-btn ${statusFilter === 'ACTIVE' ? 'active' : ''}`}
              onClick={() => setStatusFilter('ACTIVE')}
            >
              Approved
            </button>
            <button
              className={`admin-tab-btn ${statusFilter === 'REJECTED' ? 'active' : ''}`}
              onClick={() => setStatusFilter('REJECTED')}
            >
              Rejected
            </button>
          </div>

          <button
            className="admin-btn admin-btn-secondary admin-btn-sm"
            onClick={fetchApplications}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Queue</span>
          </button>
        </div>

        {/* Table of Applications */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
            <Loader2 size={32} className="animate-spin" style={{ color: '#2563EB', margin: '0 auto 0.5rem' }} />
            <p style={{ color: '#64748B', fontSize: '0.875rem' }}>Loading provider applications...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#DC2626' }}>
            <AlertTriangle size={32} style={{ margin: '0 auto 0.5rem' }} />
            <p>{error}</p>
            <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={fetchApplications} style={{ marginTop: '0.5rem' }}>
              Retry
            </button>
          </div>
        ) : applications.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">
              <UserCheck size={26} />
            </div>
            <h4>No Provider Applications Found</h4>
            <p style={{ fontSize: '0.85rem' }}>
              {statusFilter === 'PENDING'
                ? 'All provider registration applications have been reviewed. No pending items in queue.'
                : 'No transport provider records found matching this status filter.'}
            </p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Provider / Business</th>
                  <th>License & Area</th>
                  <th>Submitted Docs</th>
                  <th>Application Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <div>
                        <strong style={{ color: '#0F172A', display: 'block' }}>
                          {app.businessName || `${app.firstName} ${app.lastName}`}
                        </strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                          Contact: {app.firstName} {app.lastName} • {app.email}
                        </span>
                        {app.phone && (
                          <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>
                            Phone: {app.phone}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div>
                        <span style={{ fontWeight: 600, color: '#334155', display: 'block', fontSize: '0.825rem' }}>
                          License: {app.licenseNumber || 'Under Review'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                          Service Area: {app.serviceArea || 'Addis Ababa'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <FileText size={15} style={{ color: '#2563EB' }} />
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
                          {app.accountDocuments?.length || 0} document(s)
                        </span>
                      </div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem', color: '#64748B' }}>
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <StatusBadge status={app.status} />
                      {app.rejectionReason && (
                        <div style={{ fontSize: '0.72rem', color: '#DC2626', marginTop: '0.2rem', maxWidth: '180px' }}>
                          Reason: {app.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                          onClick={() => setSelectedApp(app)}
                          title="View Application Details & Documentation"
                        >
                          <Eye size={13} /> Review
                        </button>

                        {app.status === 'PENDING' && (
                          <>
                            <button
                              className="admin-btn admin-btn-success admin-btn-sm"
                              disabled={actionLoadingId === app.id}
                              onClick={() => handleApprove(app)}
                              title="Approve Provider Application"
                            >
                              Approve
                            </button>
                            <button
                              className="admin-btn admin-btn-danger admin-btn-sm"
                              disabled={actionLoadingId === app.id}
                              onClick={() => setRejectionTarget(app)}
                              title="Reject Application (Requires Reason)"
                            >
                              Reject
                            </button>
                          </>
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

      {/* Provider Details & Document Review Modal */}
      {selectedApp && (
        <div className="admin-modal-overlay" onClick={() => setSelectedApp(null)}>
          <div className="admin-modal" style={{ maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3 className="admin-modal-title">
                  Provider Application Review • {selectedApp.businessName || `${selectedApp.firstName} ${selectedApp.lastName}`}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>{selectedApp.email}</span>
              </div>
              <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => setSelectedApp(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="admin-modal-body">
              {/* Applicant Info Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Contact Person</span>
                  <strong style={{ fontSize: '0.9rem', color: '#0F172A' }}>{selectedApp.firstName} {selectedApp.lastName}</strong>
                </div>

                <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Email Address</span>
                  <strong style={{ fontSize: '0.9rem', color: '#0F172A' }}>{selectedApp.email}</strong>
                </div>

                <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Phone Contact</span>
                  <strong style={{ fontSize: '0.9rem', color: '#0F172A' }}>{selectedApp.phone || 'Not provided'}</strong>
                </div>

                <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Application Status</span>
                  <div style={{ marginTop: '0.2rem' }}>
                    <StatusBadge status={selectedApp.status} />
                  </div>
                </div>
              </div>

              {/* Commercial & Operational Credentials */}
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: '#EFF6FF',
                  borderRadius: '8px',
                  border: '1px solid #BFDBFE',
                  marginBottom: '1.5rem',
                }}
              >
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E40AF', marginBottom: '0.5rem' }}>
                  Transit Operations Profile
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: '#1E3A8A', display: 'block', fontSize: '0.75rem' }}>Business Name:</span>
                    <strong>{selectedApp.businessName || 'Independent Operator'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#1E3A8A', display: 'block', fontSize: '0.75rem' }}>Commercial License:</span>
                    <strong>{selectedApp.licenseNumber || 'None specified'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#1E3A8A', display: 'block', fontSize: '0.75rem' }}>Operating Zone:</span>
                    <strong>{selectedApp.serviceArea || 'Addis Ababa Greater Metro'}</strong>
                  </div>
                </div>
              </div>

              {/* Submitted Verification Documents */}
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.75rem' }}>
                Uploaded Verification Documents ({selectedApp.accountDocuments?.length || 0})
              </h4>

              {(!selectedApp.accountDocuments || selectedApp.accountDocuments.length === 0) ? (
                <div style={{ padding: '1rem', textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: '8px', color: '#64748B', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                  No uploaded account documents found on record for this provider.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  {selectedApp.accountDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      style={{
                        padding: '0.85rem 1rem',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: '#FFFFFF',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <FileText
                          size={20}
                          style={{
                            color: doc.documentName?.toLowerCase().endsWith('.pdf') ? '#D97706' : '#2563EB',
                          }}
                        />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <strong style={{ fontSize: '0.875rem', color: '#0F172A' }}>
                              {doc.documentType.replace(/_/g, ' ')}
                            </strong>
                            <span
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                padding: '0.1rem 0.45rem',
                                borderRadius: '4px',
                                backgroundColor: doc.documentName?.toLowerCase().endsWith('.pdf') ? '#FEF3C7' : '#EFF6FF',
                                color: doc.documentName?.toLowerCase().endsWith('.pdf') ? '#92400E' : '#1D4ED8',
                              }}
                            >
                              {doc.documentName?.toLowerCase().endsWith('.pdf') ? 'PDF' : 'PNG'}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                            {doc.documentName} • Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                        <StatusBadge status={doc.status} />

                        <button
                          type="button"
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                          onClick={() => setPreviewingDoc(doc)}
                          title="Preview document in viewer"
                        >
                          <Eye size={12} /> View
                        </button>

                        <a
                          href={getAccountDocumentUrl(doc.id)}
                          target="_blank"
                          rel="noreferrer"
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                          title="Open document in new browser tab"
                        >
                          <ExternalLink size={12} />
                        </a>

                        <button
                          type="button"
                          className={`admin-btn ${doc.status === 'APPROVED' ? 'admin-btn-secondary' : 'admin-btn-success'} admin-btn-sm`}
                          onClick={() => handleReviewDocument(doc.id, 'APPROVE')}
                          title="Mark document as approved"
                        >
                          {doc.status === 'APPROVED' ? 'Approved ✓' : 'Approve'}
                        </button>

                        <button
                          type="button"
                          className={`admin-btn ${doc.status === 'REJECTED' ? 'admin-btn-secondary' : 'admin-btn-danger'} admin-btn-sm`}
                          onClick={() => handleReviewDocument(doc.id, 'REJECT')}
                          title="Reject document with note"
                        >
                          {doc.status === 'REJECTED' ? 'Rejected ✕' : 'Reject'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedApp.rejectionReason && (
                <div style={{ padding: '0.85rem', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#991B1B', fontSize: '0.85rem' }}>
                  <strong>Previous Rejection Reason:</strong> {selectedApp.rejectionReason}
                </div>
              )}
            </div>

            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={() => setSelectedApp(null)}>
                Close
              </button>

              {selectedApp.status === 'PENDING' && (
                <>
                  <button
                    className="admin-btn admin-btn-danger"
                    onClick={() => {
                      setRejectionTarget(selectedApp);
                    }}
                  >
                    Reject Application
                  </button>
                  <button
                    className="admin-btn admin-btn-success"
                    disabled={actionLoadingId === selectedApp.id}
                    onClick={() => handleApprove(selectedApp)}
                  >
                    Approve Provider
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* In-App Document Preview Modal */}
      {previewingDoc && (
        <div className="admin-modal-overlay" onClick={() => setPreviewingDoc(null)}>
          <div
            className="admin-modal"
            style={{ maxWidth: '820px', width: '95vw', height: '90vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <h3 className="admin-modal-title" style={{ margin: 0 }}>
                    {previewingDoc.documentType.replace(/_/g, ' ')}
                  </h3>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: previewingDoc.documentName?.toLowerCase().endsWith('.pdf') ? '#FEF3C7' : '#EFF6FF',
                      color: previewingDoc.documentName?.toLowerCase().endsWith('.pdf') ? '#92400E' : '#1D4ED8',
                    }}
                  >
                    {previewingDoc.documentName?.toLowerCase().endsWith('.pdf') ? 'PDF DOCUMENT' : 'PNG IMAGE'}
                  </span>
                  <StatusBadge status={previewingDoc.status} />
                </div>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  {previewingDoc.documentName} • ID: {previewingDoc.id}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <a
                  href={
                    previewingDoc.fileUrl?.startsWith('data:')
                      ? previewingDoc.fileUrl
                      : `${getAccountDocumentUrl(previewingDoc.id)}&format=${previewingDoc.documentName?.toLowerCase().endsWith('.pdf') ? 'raw' : 'image'}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="admin-btn admin-btn-secondary admin-btn-sm"
                  title="View standalone raw file"
                >
                  <Eye size={14} /> {previewingDoc.documentName?.toLowerCase().endsWith('.pdf') ? 'Raw PDF' : 'Direct Image'}
                </a>
                <a
                  href={getAccountDocumentUrl(previewingDoc.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="admin-btn admin-btn-secondary admin-btn-sm"
                  title="Open full inspection in new window"
                >
                  <ExternalLink size={14} /> Full View
                </a>
                <button
                  className="admin-btn admin-btn-secondary admin-btn-sm"
                  onClick={() => setPreviewingDoc(null)}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="admin-modal-body" style={{ padding: '0.75rem', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', overflow: 'hidden' }}>
              {previewingDoc.fileUrl?.startsWith('data:image/') ? (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto', padding: '1rem' }}>
                  <img
                    src={previewingDoc.fileUrl}
                    alt={previewingDoc.documentName || 'Document Image'}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      border: '1px solid #E2E8F0',
                    }}
                  />
                </div>
              ) : previewingDoc.fileUrl?.startsWith('data:application/pdf') ? (
                <object
                  data={previewingDoc.fileUrl}
                  type="application/pdf"
                  width="100%"
                  height="100%"
                  style={{ flex: 1, borderRadius: '8px', border: 'none' }}
                >
                  <iframe
                    src={getAccountDocumentUrl(previewingDoc.id)}
                    title="Document Viewer"
                    style={{ width: '100%', height: '100%', flex: 1, border: 'none', borderRadius: '8px' }}
                  />
                </object>
              ) : (
                <iframe
                  src={getAccountDocumentUrl(previewingDoc.id)}
                  title="Document Viewer"
                  style={{
                    width: '100%',
                    height: '100%',
                    flex: 1,
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: '#F8FAFC',
                  }}
                />
              )}
            </div>

            <div className="admin-modal-footer">
              <button
                className="admin-btn admin-btn-secondary"
                onClick={() => setPreviewingDoc(null)}
              >
                Close Preview
              </button>
              <button
                type="button"
                className={`admin-btn ${previewingDoc.status === 'REJECTED' ? 'admin-btn-secondary' : 'admin-btn-danger'}`}
                onClick={() => {
                  handleReviewDocument(previewingDoc.id, 'REJECT');
                  setPreviewingDoc(null);
                }}
                title="Reject document with note"
              >
                {previewingDoc.status === 'REJECTED' ? 'Rejected ✕' : 'Reject Document'}
              </button>
              <button
                type="button"
                className={`admin-btn ${previewingDoc.status === 'APPROVED' ? 'admin-btn-secondary' : 'admin-btn-success'}`}
                onClick={() => {
                  handleReviewDocument(previewingDoc.id, 'APPROVE');
                  setPreviewingDoc(null);
                }}
                title="Approve document"
              >
                {previewingDoc.status === 'APPROVED' ? 'Approved ✓' : 'Approve Document'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
