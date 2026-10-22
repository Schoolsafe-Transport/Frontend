import { useState, useEffect, FC, FormEvent } from 'react';
import {
  apiClient,
  getAdminPaymentsApi,
  reviewAdminPaymentApi,
  PaymentRecord,
} from '../../services/api';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Search,
  Loader2,
  XCircle,
  Eye,
  RefreshCw,
  User,
  Bus,
} from 'lucide-react';

export const AdminPaymentsReview: FC = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>('PENDING_REVIEW');
  const [searchQuery, setSearchQuery] = useState('');

  // Action Modals
  const [actionPayment, setActionPayment] = useState<PaymentRecord | null>(null);
  const [actionDecision, setActionDecision] = useState<'APPROVE' | 'REJECT' | 'REQUEST_NEW_RECEIPT'>('APPROVE');
  const [actionReason, setActionReason] = useState('');
  const [submittingDecision, setSubmittingDecision] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Receipt Preview Modal
  const [previewPayment, setPreviewPayment] = useState<PaymentRecord | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      const data = await getAdminPaymentsApi(params);
      setPayments(data.payments || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load payment review records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [statusFilter]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    loadPayments();
  };

  const openDecisionModal = (payment: PaymentRecord, decision: 'APPROVE' | 'REJECT' | 'REQUEST_NEW_RECEIPT') => {
    setActionPayment(payment);
    setActionDecision(decision);
    setActionReason('');
    setModalError(null);
  };

  const handleConfirmDecision = async (e: FormEvent) => {
    e.preventDefault();
    if (!actionPayment) return;

    if ((actionDecision === 'REJECT' || actionDecision === 'REQUEST_NEW_RECEIPT') && (!actionReason.trim() || actionReason.trim().length < 5)) {
      setModalError('Please specify a detailed rejection or resubmission reason (at least 5 characters).');
      return;
    }

    try {
      setSubmittingDecision(true);
      setModalError(null);
      await reviewAdminPaymentApi(actionPayment.id, {
        decision: actionDecision,
        reason: actionReason.trim() || undefined,
      });

      const message = actionDecision === 'APPROVE'
        ? `Payment #${actionPayment.reference} approved and agreement activated.`
        : `Payment #${actionPayment.reference} marked as ${actionDecision}. Notification dispatched to parent.`;

      setSuccessNotice(message);
      setActionPayment(null);
      await loadPayments();
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Failed to record payment decision.');
    } finally {
      setSubmittingDecision(false);
    }
  };

  const handleOpenReceipt = async (payment: PaymentRecord) => {
    setPreviewPayment(payment);
    setPreviewBlobUrl(null);
    setPreviewError(null);
    setPreviewLoading(true);

    try {
      const res = await apiClient.get(`/transportation/payments/${payment.id}/receipt`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: res.headers['content-type'] || 'image/jpeg' });
      const objectUrl = URL.createObjectURL(blob);
      setPreviewBlobUrl(objectUrl);
    } catch (err: any) {
      setPreviewError(err.response?.data?.message || 'Failed to load receipt evidence. Ensure you have authorized permissions.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const closeReceiptModal = () => {
    if (previewBlobUrl) {
      URL.revokeObjectURL(previewBlobUrl);
    }
    setPreviewPayment(null);
    setPreviewBlobUrl(null);
  };

  return (
    <div className="admin-queue-container" style={{ padding: '1rem 0' }}>
      {/* Header and Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--color-primary)' }}>
            Payment Receipts Review & Verification
          </h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Authoritative manual evidence review for school transportation fees. Review uploaded bank / mobile money slips.
          </p>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={loadPayments}
          disabled={loading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Queue
        </button>
      </div>

      {/* Global Alerts */}
      {error && (
        <div style={{ padding: '0.75rem 1rem', marginBottom: '1rem', backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {successNotice && (
        <div style={{ padding: '0.75rem 1rem', marginBottom: '1rem', backgroundColor: '#DCFCE7', color: '#166534', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
          <CheckCircle2 size={16} />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {(['PENDING_REVIEW', 'ALL', 'APPROVED', 'REJECTED', 'UNPAID'] as const).map((tab) => (
            <button
              key={tab}
              className={`btn btn-sm ${statusFilter === tab ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStatusFilter(tab)}
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '240px' }}>
          <input
            type="text"
            className="filter-input"
            placeholder="Search reference, parent name, student, or route..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ fontSize: '0.85rem', padding: '0.4rem 0.75rem' }}
          />
          <button type="submit" className="btn btn-secondary btn-sm" style={{ padding: '0.4rem 0.75rem' }}>
            <Search size={14} />
          </button>
        </form>
      </div>

      {/* Payment Items Grid / Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-text-secondary)' }}>
          <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto 0.5rem' }} />
          <p>Loading payment evidence queue...</p>
        </div>
      ) : payments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', border: '1px dashed var(--color-border)', borderRadius: '12px', backgroundColor: '#F8FAFC' }}>
          <CreditCard size={40} style={{ color: 'var(--color-text-secondary)', margin: '0 auto 0.75rem' }} />
          <h4 style={{ margin: '0 0 0.25rem', color: 'var(--color-text-primary)' }}>No Payment Records Found</h4>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            There are currently no transportation payments matching the selected status filter.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {payments.map((p) => {
            const isPendingReview = p.status === 'PENDING_REVIEW';
            const isApproved = p.status === 'APPROVED' || p.status === 'PAID';
            const isRejected = p.status === 'REJECTED';

            const statusColor = isApproved
              ? '#166534'
              : isPendingReview
              ? '#B45309'
              : isRejected
              ? '#991B1B'
              : '#475569';

            const statusBg = isApproved
              ? '#DCFCE7'
              : isPendingReview
              ? '#FEF3C7'
              : isRejected
              ? '#FEE2E2'
              : '#F1F5F9';

            return (
              <div
                key={p.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid var(--color-border)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                {/* Header row: Reference, status badge, amount */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                        Ref: {p.reference}
                      </span>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.55rem',
                          borderRadius: '9999px',
                          color: statusColor,
                          backgroundColor: statusBg,
                        }}
                      >
                        {p.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                      Submitted: {p.receiptUploadedAt ? new Date(p.receiptUploadedAt).toLocaleString() : 'No receipt uploaded'}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                      ETB {p.amount.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                      Method: {p.paymentMethod || 'MANUAL_TRANSFER'}
                    </div>
                  </div>
                </div>

                {/* Details grid: Student, Route, Parent, Provider */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1rem',
                    padding: '0.75rem',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '8px',
                    fontSize: '0.825rem',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <User size={12} /> Student & Route
                    </div>
                    <div><strong>{p.student?.firstName} {p.student?.lastName}</strong></div>
                    <div style={{ color: 'var(--color-text-secondary)' }}>{p.route?.name}</div>
                    <div style={{ color: 'var(--color-text-secondary)' }}>{p.route?.destinationSchool}</div>
                  </div>

                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.2rem' }}>
                      Parent Details
                    </div>
                    <div><strong>{p.parent?.firstName} {p.parent?.lastName}</strong></div>
                    <div style={{ color: 'var(--color-text-secondary)' }}>{p.parent?.email}</div>
                    {p.parent?.phone && <div style={{ color: 'var(--color-text-secondary)' }}>{p.parent?.phone}</div>}
                  </div>

                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Bus size={12} /> Transport Provider
                    </div>
                    <div><strong>{p.provider?.firstName} {p.provider?.lastName}</strong></div>
                    <div style={{ color: 'var(--color-text-secondary)' }}>{p.provider?.email}</div>
                    {p.vehicle && (
                      <div style={{ color: 'var(--color-text-secondary)' }}>
                        Vehicle: {p.vehicle.model} ({p.vehicle.plateNumber})
                      </div>
                    )}
                  </div>
                </div>

                {/* Parent notes & rejection notes */}
                {p.notes && (
                  <div style={{ fontSize: '0.825rem', padding: '0.5rem 0.75rem', backgroundColor: '#EFF6FF', borderRadius: '6px', color: '#1E40AF' }}>
                    <strong>Parent Note / Claimed Reference:</strong> {p.notes}
                  </div>
                )}

                {p.rejectionReason && (
                  <div style={{ fontSize: '0.825rem', padding: '0.5rem 0.75rem', backgroundColor: '#FEF2F2', borderRadius: '6px', color: '#991B1B' }}>
                    <strong>Admin Rejection Reason:</strong> {p.rejectionReason}
                    {p.reviewedBy && <span style={{ marginLeft: '0.5rem', color: '#B91C1C' }}>(Reviewed by {p.reviewedBy.firstName} {p.reviewedBy.lastName})</span>}
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderTop: '1px solid #E2E8F0', paddingTop: '0.75rem' }}>
                  <div>
                    {p.receiptUrl ? (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleOpenReceipt(p)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}
                      >
                        <Eye size={14} /> View Evidence Receipt
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                        No receipt file uploaded yet
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {isPendingReview && (
                      <>
                        <button
                          className="btn btn-sm"
                          style={{
                            backgroundColor: '#DCFCE7',
                            color: '#166534',
                            border: '1px solid #86EFAC',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontWeight: 700,
                          }}
                          onClick={() => openDecisionModal(p, 'APPROVE')}
                        >
                          <CheckCircle2 size={14} /> Approve Payment
                        </button>

                        <button
                          className="btn btn-sm"
                          style={{
                            backgroundColor: '#FEE2E2',
                            color: '#991B1B',
                            border: '1px solid #FCA5A5',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontWeight: 700,
                          }}
                          onClick={() => openDecisionModal(p, 'REJECT')}
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      </>
                    )}

                    {isApproved && (
                      <span style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <CheckCircle2 size={14} /> Approved on {p.reviewedAt ? new Date(p.reviewedAt).toLocaleDateString() : 'N/A'}
                      </span>
                    )}

                    {isRejected && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => openDecisionModal(p, 'APPROVE')}
                        style={{ fontSize: '0.8rem' }}
                      >
                        Override & Approve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Decision Confirmation Modal */}
      {actionPayment && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', color: actionDecision === 'APPROVE' ? '#166534' : '#991B1B', margin: 0 }}>
                {actionDecision === 'APPROVE' ? 'Confirm Payment Approval' : 'Reject Payment Evidence'}
              </h3>
              <button onClick={() => setActionPayment(null)}>
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmDecision}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {modalError && (
                  <div style={{ padding: '0.5rem 0.75rem', backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: '6px', fontSize: '0.85rem' }}>
                    {modalError}
                  </div>
                )}

                <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.875rem' }}>
                  <div><strong>Payment Ref:</strong> {actionPayment.reference}</div>
                  <div><strong>Amount:</strong> ETB {actionPayment.amount.toLocaleString()}</div>
                  <div><strong>Parent:</strong> {actionPayment.parent?.firstName} {actionPayment.parent?.lastName}</div>
                  <div><strong>Student:</strong> {actionPayment.student?.firstName} {actionPayment.student?.lastName}</div>
                </div>

                {actionDecision === 'APPROVE' ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                    Confirming this payment will mark the payment as <strong>APPROVED</strong> and immediately activate the child's transportation agreement. Ensure you have verified the transaction funds in the CBE or Telebirr merchant account.
                  </p>
                ) : (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--color-text-primary)' }}>
                      Rejection Reason (Sent to Parent) *
                    </label>
                    <textarea
                      rows={3}
                      className="filter-input"
                      placeholder="e.g. Transaction reference not found on bank statement, screenshot unreadable, or amount mismatch..."
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                      required
                      style={{ width: '100%' }}
                    />
                  </div>
                )}
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setActionPayment(null)}
                  disabled={submittingDecision}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-sm"
                  disabled={submittingDecision}
                  style={{
                    backgroundColor: actionDecision === 'APPROVE' ? '#166534' : '#DC2626',
                    color: '#FFFFFF',
                    fontWeight: 700,
                  }}
                >
                  {submittingDecision ? 'Saving...' : actionDecision === 'APPROVE' ? 'Confirm Approval' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Secure Receipt Preview Modal */}
      {previewPayment && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--color-primary)' }}>
                  Payment Receipt Evidence
                </h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  Ref: {previewPayment.reference} • {previewPayment.receiptOriginalName || 'receipt'}
                </p>
              </div>
              <button onClick={closeReceiptModal}>
                <XCircle size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ textAlign: 'center', padding: '1rem' }}>
              {previewLoading ? (
                <div style={{ padding: '2rem 0' }}>
                  <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto 0.5rem' }} />
                  <p style={{ fontSize: '0.85rem' }}>Fetching private receipt from secure storage...</p>
                </div>
              ) : previewError ? (
                <div style={{ padding: '1.5rem', color: '#991B1B', backgroundColor: '#FEE2E2', borderRadius: '8px' }}>
                  <AlertCircle size={24} style={{ margin: '0 auto 0.5rem' }} />
                  <p style={{ margin: 0, fontSize: '0.875rem' }}>{previewError}</p>
                </div>
              ) : previewBlobUrl ? (
                <div>
                  {previewPayment.receiptMimeType === 'application/pdf' ? (
                    <iframe
                      src={previewBlobUrl}
                      style={{ width: '100%', height: '450px', border: '1px solid #E2E8F0', borderRadius: '6px' }}
                      title="Receipt PDF"
                    />
                  ) : (
                    <img
                      src={previewBlobUrl}
                      alt="Uploaded Receipt Evidence"
                      style={{ maxWidth: '100%', maxHeight: '450px', objectFit: 'contain', borderRadius: '6px', border: '1px solid #E2E8F0' }}
                    />
                  )}
                  <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                    Original file: {previewPayment.receiptOriginalName} ({previewPayment.receiptSize ? `${Math.round(previewPayment.receiptSize / 1024)} KB` : ''})
                  </div>
                </div>
              ) : null}
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary btn-sm" onClick={closeReceiptModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
