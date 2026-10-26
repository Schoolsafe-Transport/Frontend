import type { FC } from 'react';
import { useEffect, useState } from 'react';
import {
  Building2,
  Search,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Eye,
  FileText,
  ExternalLink,
  X,
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

export const AdminBusinessesPage: FC<{ onRefreshStats?: () => void }> = ({ onRefreshStats }) => {
  const [businesses, setBusinesses] = useState<AdminApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'REJECTED'>('ALL');

  const [selectedBusiness, setSelectedBusiness] = useState<AdminApplication | null>(null);
  const [previewingDoc, setPreviewingDoc] = useState<any | null>(null);
  const [rejectionTarget, setRejectionTarget] = useState<AdminApplication | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {
        role: 'BUSINESS',
      };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const data = await getAdminApplicationsApi(params);
      setBusinesses(data || []);
    } catch (err: any) {
      console.error('[AdminBusinesses] Error loading business accounts:', err);
      setError(err?.response?.data?.message || 'Failed to load business accounts from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBusinesses();
  };

  const handleApprove = async (business: AdminApplication) => {
    try {
      setActionLoadingId(business.id);
      await reviewAdminApplicationApi(business.id, 'APPROVE');
      setToastMessage({
        type: 'success',
        text: `Business account for ${business.businessName || business.firstName} APPROVED.`,
      });
      await fetchBusinesses();
      if (onRefreshStats) onRefreshStats();
      if (selectedBusiness && selectedBusiness.id === business.id) {
        setSelectedBusiness((prev) => (prev ? { ...prev, status: 'ACTIVE' } : null));
      }
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to approve business account.',
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
        text: `Business account for ${rejectionTarget.businessName || rejectionTarget.firstName} has been REJECTED.`,
      });
      setRejectionTarget(null);
      await fetchBusinesses();
      if (onRefreshStats) onRefreshStats();
      if (selectedBusiness && selectedBusiness.id === rejectionTarget.id) {
        setSelectedBusiness((prev) => (prev ? { ...prev, status: 'REJECTED', rejectionReason: reason } : null));
      }
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to reject business account.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReviewDocument = async (docId: string, decision: 'APPROVE' | 'REJECT') => {
    try {
      await reviewAccountDocumentApi(docId, { decision });
      setToastMessage({
        type: 'success',
        text: `Document has been marked as ${decision}.`,
      });
      if (selectedBusiness) {
        const updatedDocs = (selectedBusiness.accountDocuments || []).map((d) =>
          d.id === docId ? { ...d, status: decision === 'APPROVE' ? 'APPROVED' : 'REJECTED' } : d
        );
        setSelectedBusiness({ ...selectedBusiness, accountDocuments: updatedDocs as any });
      }
      await fetchBusinesses();
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to update document status.',
      });
    }
  };

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

      {/* Rejection Modal */}
      <RejectionModal
        isOpen={Boolean(rejectionTarget)}
        title="Reject Business Account Application"
        itemDescription={
          rejectionTarget
            ? `${rejectionTarget.businessName || `${rejectionTarget.firstName} ${rejectionTarget.lastName}`} (${rejectionTarget.email})`
            : undefined
        }
        placeholder="State reason for business rejection (e.g. invalid tax registration, unauthorized commercial activity)..."
        onClose={() => setRejectionTarget(null)}
        onConfirm={handleConfirmRejection}
      />

      {/* Main Card */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">
              <Building2 size={20} style={{ color: '#2563EB' }} />
              Business & Advertiser Account Approvals ({businesses.length})
            </h2>
            <p className="admin-card-desc">
              Review corporate merchant accounts, verify tax credentials, and authorize advertising access
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
                placeholder="Search business name, email..."
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
              All Accounts
            </button>
            <button
              className={`admin-tab-btn ${statusFilter === 'PENDING' ? 'active' : ''}`}
              onClick={() => setStatusFilter('PENDING')}
            >
              Pending Review
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
            onClick={fetchBusinesses}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Businesses Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
            <Loader2 size={32} className="animate-spin" style={{ color: '#2563EB', margin: '0 auto 0.5rem' }} />
            <p style={{ color: '#64748B', fontSize: '0.875rem' }}>Loading business accounts from database...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#DC2626' }}>
            <AlertTriangle size={32} style={{ margin: '0 auto 0.5rem' }} />
            <p>{error}</p>
            <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={fetchBusinesses} style={{ marginTop: '0.5rem' }}>
              Retry
            </button>
          </div>
        ) : businesses.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">
              <Building2 size={26} />
            </div>
            <h4>No Business Accounts Found</h4>
            <p style={{ fontSize: '0.85rem' }}>
              {statusFilter === 'PENDING'
                ? 'All business applications have been reviewed. No pending accounts.'
                : 'No corporate business accounts found matching your selected filter.'}
            </p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Business Enterprise</th>
                  <th>Contact Person</th>
                  <th>Commercial License</th>
                  <th>Submitted Docs</th>
                  <th>Registration Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {businesses.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <div>
                        <strong style={{ color: '#0F172A', display: 'block', fontSize: '0.95rem' }}>
                          {b.businessName || 'Business Partner'}
                        </strong>
                      </div>
                    </td>
                    <td>
                      <strong style={{ color: '#334155', display: 'block' }}>
                        {b.firstName} {b.lastName}
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        {b.email} {b.phone ? `• ${b.phone}` : ''}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#2563EB', fontSize: '0.825rem' }}>
                        {b.licenseNumber || 'Not submitted'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: '#475569', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <FileText size={14} style={{ color: '#2563EB' }} />
                        {b.accountDocuments?.length || 0} document(s)
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem', color: '#64748B' }}>
                      {new Date(b.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <StatusBadge status={b.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                          onClick={() => setSelectedBusiness(b)}
                          title="View Business Details"
                        >
                          <Eye size={13} /> Details
                        </button>

                        {b.status === 'PENDING' && (
                          <>
                            <button
                              className="admin-btn admin-btn-success admin-btn-sm"
                              disabled={actionLoadingId === b.id}
                              onClick={() => handleApprove(b)}
                              title="Approve Business Account"
                            >
                              Approve
                            </button>
                            <button
                              className="admin-btn admin-btn-danger admin-btn-sm"
                              disabled={actionLoadingId === b.id}
                              onClick={() => setRejectionTarget(b)}
                              title="Reject Business Account"
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

      {/* Details Modal */}
      {selectedBusiness && (
        <div className="admin-modal-overlay" onClick={() => setSelectedBusiness(null)}>
          <div className="admin-modal" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3 className="admin-modal-title">
                  {selectedBusiness.businessName || `${selectedBusiness.firstName} ${selectedBusiness.lastName}`}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Commercial Advertiser Account</span>
              </div>
              <button
                className="admin-btn admin-btn-secondary admin-btn-sm"
                onClick={() => setSelectedBusiness(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Primary Contact</span>
                  <strong>{selectedBusiness.firstName} {selectedBusiness.lastName}</strong>
                </div>
                <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Email</span>
                  <strong>{selectedBusiness.email}</strong>
                </div>
                <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Commercial License</span>
                  <strong>{selectedBusiness.licenseNumber || 'None'}</strong>
                </div>
                <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Account Status</span>
                  <div style={{ marginTop: '0.2rem' }}>
                    <StatusBadge status={selectedBusiness.status} />
                  </div>
                </div>
              </div>

              {/* Submitted Commercial Documents */}
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.75rem' }}>
                Submitted Commercial Documents ({selectedBusiness.accountDocuments?.length || 0})
              </h4>

              {(!selectedBusiness.accountDocuments || selectedBusiness.accountDocuments.length === 0) ? (
                <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px dashed #CBD5E1', textAlign: 'center', marginBottom: '1.5rem', color: '#64748B', fontSize: '0.85rem' }}>
                  No documents uploaded yet by this business applicant.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  {selectedBusiness.accountDocuments.map((doc) => (
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
                        <FileText size={20} style={{ color: '#2563EB' }} />
                        <div>
                          <strong style={{ fontSize: '0.875rem', color: '#0F172A', display: 'block' }}>
                            {doc.documentType.replace('_', ' ')}
                          </strong>
                          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                            {doc.documentName} • Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
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
                        <StatusBadge status={doc.status} />

                        <button
                          type="button"
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                          onClick={() => setPreviewingDoc(doc)}
                          title="Preview document"
                        >
                          <Eye size={12} /> View
                        </button>

                        <a
                          href={getAccountDocumentUrl(doc.id)}
                          target="_blank"
                          rel="noreferrer"
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                          title="Open document file in new tab"
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

              {selectedBusiness.rejectionReason && (
                <div style={{ padding: '0.85rem', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#991B1B', fontSize: '0.85rem' }}>
                  <strong>Rejection Reason:</strong> {selectedBusiness.rejectionReason}
                </div>
              )}
            </div>

            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={() => setSelectedBusiness(null)}>
                Close
              </button>

              {selectedBusiness.status === 'PENDING' && (
                <>
                  <button
                    className="admin-btn admin-btn-danger"
                    onClick={() => setRejectionTarget(selectedBusiness)}
                  >
                    Reject
                  </button>
                  <button
                    className="admin-btn admin-btn-success"
                    disabled={actionLoadingId === selectedBusiness.id}
                    onClick={() => handleApprove(selectedBusiness)}
                  >
                    Approve Business
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
                <h3 className="admin-modal-title">
                  {previewingDoc.documentType.replace(/_/g, ' ')}
                </h3>
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
              {(previewingDoc.status === 'PENDING' || previewingDoc.status === 'PENDING_REVIEW') && (
                <>
                  <button
                    className="admin-btn admin-btn-danger"
                    onClick={() => {
                      handleReviewDocument(previewingDoc.id, 'REJECT');
                      setPreviewingDoc(null);
                    }}
                  >
                    Reject Document
                  </button>
                  <button
                    className="admin-btn admin-btn-success"
                    onClick={() => {
                      handleReviewDocument(previewingDoc.id, 'APPROVE');
                      setPreviewingDoc(null);
                    }}
                  >
                    Approve Document
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
