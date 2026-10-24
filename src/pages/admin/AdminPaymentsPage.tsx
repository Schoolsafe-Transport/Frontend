import type { FC } from 'react';
import { useEffect, useState } from 'react';
import {
  CreditCard,
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
  getAdminPaymentsApi,
  reviewAdminPaymentApi,
  getPaymentReceiptUrl,
  PaymentRecord,
} from '../../services/api';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { RejectionModal } from '../../components/admin/RejectionModal';

export const AdminPaymentsPage: FC<{ onRefreshStats?: () => void }> = ({ onRefreshStats }) => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Selected payment for receipt review modal
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);

  // Rejection modal target
  const [rejectionTarget, setRejectionTarget] = useState<PaymentRecord | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {
        page,
        limit: 15,
      };
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }

      const res = await getAdminPaymentsApi(params);
      setPayments(res.payments || []);
      setTotalPages(res.totalPages || 1);
      setTotalCount(res.total || 0);
    } catch (err: any) {
      console.error('[AdminPayments] Error loading payments:', err);
      setError(err?.response?.data?.message || 'Failed to retrieve payment records from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPayments();
  };

  const handleApprove = async (payment: PaymentRecord) => {
    if (!window.confirm(`Confirm verification of payment receipt (ETB ${payment.amount}) for student ${payment.student?.firstName || 'booking'}?`)) {
      return;
    }

    try {
      setActionLoadingId(payment.id);
      await reviewAdminPaymentApi(payment.id, { decision: 'APPROVE' });
      setToastMessage({
        type: 'success',
        text: `Payment ${payment.reference} of ETB ${payment.amount} has been APPROVED and officially ledgered.`,
      });
      await fetchPayments();
      if (onRefreshStats) onRefreshStats();
      if (selectedPayment && selectedPayment.id === payment.id) {
        setSelectedPayment((prev) => (prev ? { ...prev, status: 'APPROVED' } : null));
      }
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to approve payment receipt.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmRejection = async (reason: string) => {
    if (!rejectionTarget) return;

    try {
      setActionLoadingId(rejectionTarget.id);
      await reviewAdminPaymentApi(rejectionTarget.id, { decision: 'REJECT', reason });
      setToastMessage({
        type: 'success',
        text: `Payment receipt ${rejectionTarget.reference} has been REJECTED. Parent notified to upload valid evidence.`,
      });
      setRejectionTarget(null);
      await fetchPayments();
      if (onRefreshStats) onRefreshStats();
      if (selectedPayment && selectedPayment.id === rejectionTarget.id) {
        setSelectedPayment((prev) => (prev ? { ...prev, status: 'REJECTED', rejectionReason: reason } : null));
      }
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to reject payment evidence.',
      });
    } finally {
      setActionLoadingId(null);
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

      {/* Rejection Reason Modal */}
      <RejectionModal
        isOpen={Boolean(rejectionTarget)}
        title="Reject Payment Receipt"
        itemDescription={
          rejectionTarget
            ? `Reference: ${rejectionTarget.reference} • Amount: ETB ${rejectionTarget.amount}`
            : undefined
        }
        placeholder="State reason for rejecting receipt (e.g. illegible screenshot, transfer amount mismatch, invalid beneficiary account)..."
        onClose={() => setRejectionTarget(null)}
        onConfirm={handleConfirmRejection}
      />

      {/* Main Card */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">
              <CreditCard size={20} style={{ color: '#2563EB' }} />
              Payment Receipts & Transaction Review Queue ({totalCount})
            </h2>
            <p className="admin-card-desc">
              Inspect uploaded bank transfer receipts, verify transit fee collections, and enforce financial authenticity
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
                placeholder="Search reference, parent name..."
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
              onClick={() => {
                setStatusFilter('ALL');
                setPage(1);
              }}
            >
              All Payments
            </button>
            <button
              className={`admin-tab-btn ${statusFilter === 'PENDING' ? 'active' : ''}`}
              onClick={() => {
                setStatusFilter('PENDING');
                setPage(1);
              }}
            >
              Awaiting Review
            </button>
            <button
              className={`admin-tab-btn ${statusFilter === 'APPROVED' ? 'active' : ''}`}
              onClick={() => {
                setStatusFilter('APPROVED');
                setPage(1);
              }}
            >
              Approved / Verified
            </button>
            <button
              className={`admin-tab-btn ${statusFilter === 'REJECTED' ? 'active' : ''}`}
              onClick={() => {
                setStatusFilter('REJECTED');
                setPage(1);
              }}
            >
              Rejected Evidence
            </button>
          </div>

          <button
            className="admin-btn admin-btn-secondary admin-btn-sm"
            onClick={fetchPayments}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Payments Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
            <Loader2 size={32} className="animate-spin" style={{ color: '#2563EB', margin: '0 auto 0.5rem' }} />
            <p style={{ color: '#64748B', fontSize: '0.875rem' }}>Loading payments from database...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#DC2626' }}>
            <AlertTriangle size={32} style={{ margin: '0 auto 0.5rem' }} />
            <p>{error}</p>
            <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={fetchPayments} style={{ marginTop: '0.5rem' }}>
              Retry
            </button>
          </div>
        ) : payments.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">
              <CreditCard size={26} />
            </div>
            <h4>No Payment Submissions Found</h4>
            <p style={{ fontSize: '0.85rem' }}>
              {statusFilter === 'PENDING'
                ? 'All payment receipts have been verified and processed. No pending reviews in queue.'
                : 'No payment records match your selected filter.'}
            </p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Reference & Date</th>
                  <th>Parent (Payer)</th>
                  <th>Student & Route</th>
                  <th>Amount (ETB)</th>
                  <th>Receipt Evidence</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div>
                        <strong style={{ color: '#0F172A', display: 'block', fontSize: '0.875rem' }}>
                          {p.reference}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                          {new Date(p.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong style={{ color: '#334155', display: 'block', fontSize: '0.85rem' }}>
                          {p.parent ? `${p.parent.firstName} ${p.parent.lastName}` : 'Parent Guardian'}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                          {p.parent?.email} {p.parent?.phone ? `• ${p.parent.phone}` : ''}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div>
                        {p.student && (
                          <strong style={{ color: '#2563EB', display: 'block', fontSize: '0.825rem' }}>
                            {p.student.firstName} {p.student.lastName}
                          </strong>
                        )}
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                          {p.route?.name || 'School Route'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <strong style={{ color: '#059669', fontSize: '0.95rem' }}>
                        ETB {p.amount.toLocaleString()}
                      </strong>
                      <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748B' }}>
                        {p.paymentMethod.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      {p.receiptUrl ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#2563EB', fontWeight: 600, fontSize: '0.8rem' }}>
                          <FileText size={15} />
                          <span>Receipt Attached</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>No File</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={p.status} />
                      {p.rejectionReason && (
                        <div style={{ fontSize: '0.72rem', color: '#DC2626', marginTop: '0.2rem', maxWidth: '180px' }}>
                          {p.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                          onClick={() => setSelectedPayment(p)}
                          title="Inspect Payment Receipt Evidence"
                        >
                          <Eye size={13} /> Review
                        </button>

                        {(p.status === 'PENDING' || p.status === 'PENDING_REVIEW') && (
                          <>
                            <button
                              className="admin-btn admin-btn-success admin-btn-sm"
                              disabled={actionLoadingId === p.id}
                              onClick={() => handleApprove(p)}
                              title="Approve Payment"
                            >
                              Approve
                            </button>
                            <button
                              className="admin-btn admin-btn-danger admin-btn-sm"
                              disabled={actionLoadingId === p.id}
                              onClick={() => setRejectionTarget(p)}
                              title="Reject Receipt"
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
              Page {page} of {totalPages} ({totalCount} total payment submissions)
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

      {/* Payment Receipt Inspection Modal */}
      {selectedPayment && (
        <div className="admin-modal-overlay" onClick={() => setSelectedPayment(null)}>
          <div className="admin-modal" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3 className="admin-modal-title">
                  Payment Review • Reference #{selectedPayment.reference}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  Submitted on {new Date(selectedPayment.createdAt).toLocaleString()}
                </span>
              </div>
              <button
                className="admin-btn admin-btn-secondary admin-btn-sm"
                onClick={() => setSelectedPayment(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="admin-modal-body">
              {/* Receipt Image / Document Preview */}
              {selectedPayment.receiptUrl ? (
                <div
                  style={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#F8FAFC',
                    marginBottom: '1.25rem',
                    textAlign: 'center',
                    padding: '1rem',
                  }}
                >
                  <img
                    src={getPaymentReceiptUrl(selectedPayment.id)}
                    alt={`Receipt evidence for ${selectedPayment.reference}`}
                    style={{
                      maxHeight: '320px',
                      maxWidth: '100%',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      margin: '0 auto',
                      display: 'block',
                    }}
                    onError={(e: any) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div style={{ marginTop: '0.75rem' }}>
                    <a
                      href={getPaymentReceiptUrl(selectedPayment.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                    >
                      <ExternalLink size={12} /> Open Full Receipt Document
                    </a>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#FEF2F2', borderRadius: '8px', color: '#991B1B', marginBottom: '1.25rem' }}>
                  <AlertTriangle size={24} style={{ margin: '0 auto 0.5rem' }} />
                  <p style={{ margin: 0, fontSize: '0.875rem' }}>
                    No bank transfer receipt was uploaded for this transaction reference.
                  </p>
                </div>
              )}

              {/* Transaction Specs Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Fee Amount</span>
                  <strong style={{ fontSize: '1.1rem', color: '#059669' }}>
                    ETB {selectedPayment.amount.toLocaleString()}
                  </strong>
                </div>

                <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Payer (Parent)</span>
                  <strong style={{ fontSize: '0.85rem', color: '#0F172A' }}>
                    {selectedPayment.parent ? `${selectedPayment.parent.firstName} ${selectedPayment.parent.lastName}` : 'Parent Guardian'}
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>
                    {selectedPayment.parent?.email}
                  </span>
                </div>

                <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Student Passenger</span>
                  <strong style={{ fontSize: '0.85rem', color: '#2563EB' }}>
                    {selectedPayment.student?.firstName} {selectedPayment.student?.lastName}
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>
                    {selectedPayment.route?.name}
                  </span>
                </div>

                <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Status</span>
                  <div style={{ marginTop: '0.2rem' }}>
                    <StatusBadge status={selectedPayment.status} />
                  </div>
                </div>
              </div>

              {selectedPayment.rejectionReason && (
                <div style={{ padding: '0.75rem 1rem', backgroundColor: '#FEF2F2', borderRadius: '8px', border: '1px solid #FECACA', color: '#991B1B', fontSize: '0.85rem' }}>
                  <strong>Rejection Reason:</strong> {selectedPayment.rejectionReason}
                </div>
              )}
            </div>

            <div className="admin-modal-footer">
              <button
                className="admin-btn admin-btn-secondary"
                onClick={() => setSelectedPayment(null)}
              >
                Close
              </button>

              {(selectedPayment.status === 'PENDING' || selectedPayment.status === 'PENDING_REVIEW') && (
                <>
                  <button
                    className="admin-btn admin-btn-danger"
                    onClick={() => {
                      setRejectionTarget(selectedPayment);
                    }}
                  >
                    Reject Receipt
                  </button>
                  <button
                    className="admin-btn admin-btn-success"
                    disabled={actionLoadingId === selectedPayment.id}
                    onClick={() => handleApprove(selectedPayment)}
                  >
                    Approve Payment
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
