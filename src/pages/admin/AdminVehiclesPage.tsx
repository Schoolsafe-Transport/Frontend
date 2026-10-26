import type { FC } from 'react';
import { useEffect, useState } from 'react';
import {
  Car,
  Search,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Eye,
  FileText,
  ShieldCheck,
  ShieldAlert,
  X,
  ExternalLink,
} from 'lucide-react';
import {
  getAdminVehiclesApi,
  reviewAdminVehicleApi,
  AdminVehicle,
  API_BASE_URL,
} from '../../services/api';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { RejectionModal } from '../../components/admin/RejectionModal';

export const AdminVehiclesPage: FC<{ onRefreshStats?: () => void }> = ({ onRefreshStats }) => {
  const [vehicles, setVehicles] = useState<AdminVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('PENDING');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Selected vehicle for details modal
  const [selectedVehicle, setSelectedVehicle] = useState<AdminVehicle | null>(null);

  // Rejection modal target
  const [rejectionTarget, setRejectionTarget] = useState<AdminVehicle | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {
        page,
        limit: 15,
      };
      if (search.trim()) params.search = search.trim();
      if (statusFilter === 'PENDING') params.isVerified = false;
      if (statusFilter === 'VERIFIED') params.isVerified = true;
      if (statusFilter === 'REJECTED') params.status = 'REJECTED';

      const res = await getAdminVehiclesApi(params);
      setVehicles(res.vehicles || []);
      setTotalPages(res.totalPages || 1);
      setTotalCount(res.total || 0);
    } catch (err: any) {
      console.error('[AdminVehicles] Error loading vehicles:', err);
      setError(err?.response?.data?.message || 'Failed to retrieve vehicle fleet records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchVehicles();
  };

  const handleApprove = async (vehicle: AdminVehicle) => {
    if (!window.confirm(`Approve and verify vehicle ${vehicle.make} ${vehicle.model} (${vehicle.plateNumber}) for transit operations?`)) {
      return;
    }

    try {
      setActionLoadingId(vehicle.id);
      await reviewAdminVehicleApi(vehicle.id, { decision: 'APPROVE' });
      setToastMessage({
        type: 'success',
        text: `Vehicle ${vehicle.plateNumber} (${vehicle.make} ${vehicle.model}) verified and approved.`,
      });
      await fetchVehicles();
      if (onRefreshStats) onRefreshStats();
      if (selectedVehicle && selectedVehicle.id === vehicle.id) {
        setSelectedVehicle((prev) => (prev ? { ...prev, isVerified: true, status: 'ACTIVE' } : null));
      }
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to approve vehicle.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmRejection = async (reason: string) => {
    if (!rejectionTarget) return;

    try {
      setActionLoadingId(rejectionTarget.id);
      await reviewAdminVehicleApi(rejectionTarget.id, { decision: 'REJECT', reason });
      setToastMessage({
        type: 'success',
        text: `Vehicle ${rejectionTarget.plateNumber} rejected. Rejection reason recorded and provider notified.`,
      });
      setRejectionTarget(null);
      await fetchVehicles();
      if (onRefreshStats) onRefreshStats();
      if (selectedVehicle && selectedVehicle.id === rejectionTarget.id) {
        setSelectedVehicle((prev) => (prev ? { ...prev, isVerified: false, status: 'REJECTED' } : null));
      }
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to reject vehicle verification.',
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

      {/* Rejection Modal */}
      <RejectionModal
        isOpen={Boolean(rejectionTarget)}
        title="Reject Vehicle Verification"
        itemDescription={
          rejectionTarget
            ? `${rejectionTarget.make} ${rejectionTarget.model} (Plate: ${rejectionTarget.plateNumber})`
            : undefined
        }
        placeholder="State reason for vehicle rejection (e.g. failed safety inspection, missing commercial insurance, capacity mismatch)..."
        onClose={() => setRejectionTarget(null)}
        onConfirm={handleConfirmRejection}
      />

      {/* Main Card */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">
              <Car size={20} style={{ color: '#2563EB' }} />
              Platform Vehicle Fleet & Verification ({totalCount})
            </h2>
            <p className="admin-card-desc">
              Inspect submitted vehicle assets, verify roadworthiness certificates, and enforce safety eligibility
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
                placeholder="Search plate number, make, model..."
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
              All Fleet
            </button>
            <button
              className={`admin-tab-btn ${statusFilter === 'PENDING' ? 'active' : ''}`}
              onClick={() => {
                setStatusFilter('PENDING');
                setPage(1);
              }}
            >
              Awaiting Verification
            </button>
            <button
              className={`admin-tab-btn ${statusFilter === 'VERIFIED' ? 'active' : ''}`}
              onClick={() => {
                setStatusFilter('VERIFIED');
                setPage(1);
              }}
            >
              Verified & Active
            </button>
            <button
              className={`admin-tab-btn ${statusFilter === 'REJECTED' ? 'active' : ''}`}
              onClick={() => {
                setStatusFilter('REJECTED');
                setPage(1);
              }}
            >
              Rejected
            </button>
          </div>

          <button
            className="admin-btn admin-btn-secondary admin-btn-sm"
            onClick={fetchVehicles}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Vehicle Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
            <Loader2 size={32} className="animate-spin" style={{ color: '#2563EB', margin: '0 auto 0.5rem' }} />
            <p style={{ color: '#64748B', fontSize: '0.875rem' }}>Loading vehicle fleet...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#DC2626' }}>
            <AlertTriangle size={32} style={{ margin: '0 auto 0.5rem' }} />
            <p>{error}</p>
            <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={fetchVehicles} style={{ marginTop: '0.5rem' }}>
              Retry
            </button>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">
              <Car size={26} />
            </div>
            <h4>No Vehicles Found</h4>
            <p style={{ fontSize: '0.85rem' }}>
              {statusFilter === 'PENDING'
                ? 'All registered fleet vehicles have completed verification. No pending verification requests.'
                : 'No vehicle records found matching your selected filters.'}
            </p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Vehicle Details</th>
                  <th>Assigned Provider</th>
                  <th>Capacity</th>
                  <th>Verification</th>
                  <th>Assigned Routes</th>
                  <th>Registered</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <div>
                        <strong style={{ color: '#0F172A', display: 'block', fontSize: '0.95rem' }}>
                          {v.plateNumber}
                        </strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                          {v.make} {v.model} {v.year ? `(${v.year})` : ''}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong style={{ color: '#1E40AF', display: 'block', fontSize: '0.85rem' }}>
                          {v.provider?.businessName || `${v.provider?.firstName} ${v.provider?.lastName}`}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                          {v.provider?.email} {v.provider?.phone ? `• ${v.provider.phone}` : ''}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#334155', fontSize: '0.9rem' }}>
                        {v.capacity} seats
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <StatusBadge status={v.isVerified} type="verification" />
                        <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                          Status: {v.status}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 600 }}>
                        {v.routes?.length || 0} active route(s)
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem', color: '#64748B' }}>
                      {new Date(v.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                          onClick={() => setSelectedVehicle(v)}
                          title="View Vehicle Documentation and Details"
                        >
                          <Eye size={13} /> Details
                        </button>

                        {!v.isVerified && (
                          <>
                            <button
                              className="admin-btn admin-btn-success admin-btn-sm"
                              disabled={actionLoadingId === v.id}
                              onClick={() => handleApprove(v)}
                              title="Approve and Verify Vehicle"
                            >
                              Approve
                            </button>
                            <button
                              className="admin-btn admin-btn-danger admin-btn-sm"
                              disabled={actionLoadingId === v.id}
                              onClick={() => setRejectionTarget(v)}
                              title="Reject Vehicle Verification"
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
              Page {page} of {totalPages} ({totalCount} total vehicles)
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

      {/* Vehicle Details Modal */}
      {selectedVehicle && (
        <div className="admin-modal-overlay" onClick={() => setSelectedVehicle(null)}>
          <div className="admin-modal" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3 className="admin-modal-title">
                  Vehicle Details • {selectedVehicle.plateNumber}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  {selectedVehicle.make} {selectedVehicle.model} {selectedVehicle.year ? `(${selectedVehicle.year})` : ''}
                </span>
              </div>
              <button
                className="admin-btn admin-btn-secondary admin-btn-sm"
                onClick={() => setSelectedVehicle(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Assigned Provider</span>
                  <strong style={{ fontSize: '0.9rem', color: '#0F172A' }}>
                    {selectedVehicle.provider?.businessName || `${selectedVehicle.provider?.firstName} ${selectedVehicle.provider?.lastName}`}
                  </strong>
                </div>

                <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Passenger Capacity</span>
                  <strong style={{ fontSize: '0.9rem', color: '#0F172A' }}>{selectedVehicle.capacity} Students</strong>
                </div>

                <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Verification State</span>
                  <div style={{ marginTop: '0.2rem' }}>
                    <StatusBadge status={selectedVehicle.isVerified} type="verification" />
                  </div>
                </div>

                <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Operational Status</span>
                  <div style={{ marginTop: '0.2rem' }}>
                    <StatusBadge status={selectedVehicle.status} />
                  </div>
                </div>
              </div>

              {/* Safety notice */}
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: selectedVehicle.isVerified ? '#ECFDF5' : '#FFFBEB',
                  border: `1px solid ${selectedVehicle.isVerified ? '#A7F3D0' : '#FDE68A'}`,
                  borderRadius: '8px',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: selectedVehicle.isVerified ? '#047857' : '#B45309' }}>
                  {selectedVehicle.isVerified ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
                  <span>{selectedVehicle.isVerified ? 'Eligible for School Route Dispatches' : 'Ineligible for Live Student Transit'}</span>
                </div>
                <p style={{ fontSize: '0.825rem', color: selectedVehicle.isVerified ? '#065F46' : '#92400E', marginTop: '0.35rem', margin: 0 }}>
                  {selectedVehicle.isVerified
                    ? 'This vehicle satisfies administrative verification standards and is authorized for active student route service.'
                    : 'Unapproved vehicles cannot be assigned to active school routes or transport student passengers until approved by administrators.'}
                </p>
              </div>

              {/* Uploaded Documents */}
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.75rem' }}>
                Vehicle Inspection & Insurance Documents ({selectedVehicle.documents?.length || 0})
              </h4>

              {(!selectedVehicle.documents || selectedVehicle.documents.length === 0) ? (
                <div style={{ padding: '1rem', textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: '8px', color: '#64748B', fontSize: '0.85rem' }}>
                  No vehicle documents attached to this record.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedVehicle.documents.map((doc) => (
                    <div
                      key={doc.id}
                      style={{
                        padding: '0.75rem 1rem',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <FileText size={18} style={{ color: '#2563EB' }} />
                        <div>
                          <strong style={{ fontSize: '0.85rem', color: '#0F172A', display: 'block' }}>
                            {doc.documentType.replace('_', ' ')}
                          </strong>
                          {doc.expiryDate && (
                            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                              Expires: {new Date(doc.expiryDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <StatusBadge status={doc.isVerified} type="verification" />
                        <a
                          href={
                            doc.documentUrl?.startsWith('http')
                              ? doc.documentUrl
                              : `${API_BASE_URL}${doc.documentUrl?.startsWith('/') ? doc.documentUrl : `/${doc.documentUrl}`}${
                                  localStorage.getItem('schoolsafe_access_token')
                                    ? `?token=${encodeURIComponent(localStorage.getItem('schoolsafe_access_token')!)}`
                                    : ''
                                }`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                        >
                          <ExternalLink size={12} /> View File
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="admin-modal-footer">
              <button
                className="admin-btn admin-btn-secondary"
                onClick={() => setSelectedVehicle(null)}
              >
                Close
              </button>

              {!selectedVehicle.isVerified && (
                <>
                  <button
                    className="admin-btn admin-btn-danger"
                    onClick={() => setRejectionTarget(selectedVehicle)}
                  >
                    Reject Vehicle
                  </button>
                  <button
                    className="admin-btn admin-btn-success"
                    disabled={actionLoadingId === selectedVehicle.id}
                    onClick={() => handleApprove(selectedVehicle)}
                  >
                    Verify & Approve
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
