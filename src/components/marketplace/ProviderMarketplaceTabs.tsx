import { useState, useEffect, FC } from 'react';
import {
  CheckCircle2,
  X,
  Phone,
  AlertCircle,
  Eye,
} from 'lucide-react';
import {
  apiClient,
  getTransportationRequestsApi,
  acceptRequestApi,
  rejectRequestApi,
  counterOfferApi,
  getActivePassengersApi,
} from '../../services/api';
import {
  TransportationRequest,
  ActivePassenger,
} from '../../types/transportation';
import { getSocket } from '../../services/socket';

interface ProviderMarketplaceTabsProps {
  activeTab: 'Requests' | 'Passengers';
  user: any;
}

export const ProviderMarketplaceTabs: FC<ProviderMarketplaceTabsProps> = ({
  activeTab,
  user,
}) => {
  // Requests State
  const [selectedStatusTab, setSelectedStatusTab] = useState<
    'PENDING' | 'NEGOTIATING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED'
  >('PENDING');
  const [requests, setRequests] = useState<TransportationRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestCounts, setRequestCounts] = useState({
    pending: 0,
    negotiating: 0,
    accepted: 0,
    rejected: 0,
    cancelled: 0,
  });

  // Action Modals
  const [counterModalRequest, setCounterModalRequest] = useState<TransportationRequest | null>(null);
  const [counterPrice, setCounterPrice] = useState<number | ''>('');
  const [counterMessage, setCounterMessage] = useState('');
  const [isSubmittingCounter, setIsSubmittingCounter] = useState(false);

  const [rejectModalRequest, setRejectModalRequest] = useState<TransportationRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Active Passengers Manifest State
  const [passengers, setPassengers] = useState<ActivePassenger[]>([]);
  const [passengersLoading, setPassengersLoading] = useState(false);
  const [providerReceiptPreviewUrl, setProviderReceiptPreviewUrl] = useState<string | null>(null);
  const [providerReceiptPreviewMime, setProviderReceiptPreviewMime] = useState<string | null>(null);

  const handleOpenProviderReceipt = async (paymentId: string) => {
    try {
      const res = await apiClient.get(`/transportation/payments/${paymentId}/receipt`, {
        responseType: 'blob',
      });
      const mime = res.headers['content-type'] || 'image/jpeg';
      const blob = new Blob([res.data], { type: mime });
      const objectUrl = URL.createObjectURL(blob);
      setProviderReceiptPreviewUrl(objectUrl);
      setProviderReceiptPreviewMime(mime);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Unable to open payment receipt.');
    }
  };

  const closeProviderReceipt = () => {
    if (providerReceiptPreviewUrl) {
      URL.revokeObjectURL(providerReceiptPreviewUrl);
    }
    setProviderReceiptPreviewUrl(null);
    setProviderReceiptPreviewMime(null);
  };

  const fetchRequests = async () => {
    setRequestsLoading(true);
    setActionError(null);
    try {
      const allRequests: TransportationRequest[] = await getTransportationRequestsApi();
      if (Array.isArray(allRequests)) {
        setRequestCounts({
          pending: allRequests.filter((r) => r.status === 'PENDING').length,
          negotiating: allRequests.filter((r) => r.status === 'NEGOTIATING').length,
          accepted: allRequests.filter((r) => r.status === 'ACCEPTED').length,
          rejected: allRequests.filter((r) => r.status === 'REJECTED').length,
          cancelled: allRequests.filter((r) => r.status === 'CANCELLED').length,
        });

        const filtered = allRequests.filter((r) => r.status === selectedStatusTab);
        setRequests(filtered);
      }
    } catch (_err) {
      setRequests([]);
    } finally {
      setRequestsLoading(false);
    }
  };

  const fetchPassengers = async () => {
    setPassengersLoading(true);
    try {
      const data = await getActivePassengersApi();
      setPassengers(data || []);
    } catch (_err) {
      setPassengers([]);
    } finally {
      setPassengersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'Requests') {
      fetchRequests();
    } else if (activeTab === 'Passengers') {
      fetchPassengers();
    }
  }, [activeTab, selectedStatusTab]);

  useEffect(() => {
    try {
      const socket = getSocket();
      if (!socket.connected) socket.connect();
      const onEvent = () => {
        if (activeTab === 'Requests') fetchRequests();
        if (activeTab === 'Passengers') fetchPassengers();
      };
      if (user?.id) {
        socket.on(`notify:${user.id}`, onEvent);
      }
      socket.on('transportation:request_received', onEvent);
      socket.on('transportation:counter_offer', onEvent);
      socket.on('transportation:offer_accepted', onEvent);
      socket.on('transportation:request_rejected', onEvent);

      return () => {
        socket.off('notification', onEvent);
        if (user?.id) {
          socket.off(`notify:${user.id}`, onEvent);
        }
        socket.off('transportation:request_received', onEvent);
        socket.off('transportation:counter_offer', onEvent);
        socket.off('transportation:offer_accepted', onEvent);
        socket.off('transportation:request_rejected', onEvent);
      };
    } catch (_e) {}
  }, [user?.id, activeTab]);

  const handleAcceptRequest = async (requestId: string) => {
    setActionError(null);
    setActionSuccess(null);
    try {
      await acceptRequestApi(requestId);
      setActionSuccess('Seat successfully reserved! Agreement and payment record created.');
      fetchRequests();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      if (err.response?.status === 409) {
        setActionError('Sorry, this transportation option is no longer available (Seat capacity reached).');
      } else {
        setActionError(err.response?.data?.message || 'Failed to accept request.');
      }
    }
  };

  const handleSendCounter = async () => {
    if (!counterModalRequest || !counterPrice) return;
    setIsSubmittingCounter(true);
    setActionError(null);
    try {
      await counterOfferApi(counterModalRequest.id, Number(counterPrice), counterMessage || undefined);
      setCounterModalRequest(null);
      setCounterPrice('');
      setCounterMessage('');
      setActionSuccess('Counter-offer submitted to parent.');
      fetchRequests();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to submit counter-offer.');
    } finally {
      setIsSubmittingCounter(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectModalRequest) return;
    setIsRejecting(true);
    setActionError(null);
    try {
      await rejectRequestApi(rejectModalRequest.id, rejectReason || undefined);
      setRejectModalRequest(null);
      setRejectReason('');
      setActionSuccess('Request rejected.');
      fetchRequests();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to reject request.');
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <div>
      {/* =========================================================================
          TAB: TRANSPORTATION REQUESTS
          ========================================================================= */}
      {activeTab === 'Requests' && (
        <div className="panel-card">
          <div className="panel-header">
            <div>
              <h3 className="panel-title">Transportation Seat Requests</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                Review parent passenger applications, negotiate fees, and reserve seats transactionally
              </p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={fetchRequests}>
              Refresh
            </button>
          </div>

          {actionSuccess && (
            <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={16} /> {actionSuccess}
            </div>
          )}

          {actionError && (
            <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger)', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} /> {actionError}
            </div>
          )}

          {/* Status Tabs with counts */}
          <div className="status-pill-tabs">
            <button
              className={`status-pill ${selectedStatusTab === 'PENDING' ? 'active' : ''}`}
              onClick={() => setSelectedStatusTab('PENDING')}
            >
              Pending ({requestCounts.pending})
            </button>
            <button
              className={`status-pill ${selectedStatusTab === 'NEGOTIATING' ? 'active' : ''}`}
              onClick={() => setSelectedStatusTab('NEGOTIATING')}
            >
              Negotiating ({requestCounts.negotiating})
            </button>
            <button
              className={`status-pill ${selectedStatusTab === 'ACCEPTED' ? 'active' : ''}`}
              onClick={() => setSelectedStatusTab('ACCEPTED')}
            >
              Accepted ({requestCounts.accepted})
            </button>
            <button
              className={`status-pill ${selectedStatusTab === 'REJECTED' ? 'active' : ''}`}
              onClick={() => setSelectedStatusTab('REJECTED')}
            >
              Rejected ({requestCounts.rejected})
            </button>
            <button
              className={`status-pill ${selectedStatusTab === 'CANCELLED' ? 'active' : ''}`}
              onClick={() => setSelectedStatusTab('CANCELLED')}
            >
              Cancelled ({requestCounts.cancelled})
            </button>
          </div>

          {requestsLoading ? (
            <div style={{ textAlign: 'center', padding: '2.5rem' }}>Loading requests...</div>
          ) : requests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--color-text-secondary)' }}>
              No {selectedStatusTab.toLowerCase()} requests found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {requests.map((req) => (
                <div
                  key={req.id}
                  style={{
                    padding: '1.25rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: '10px',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h4 style={{ color: 'var(--color-primary)', fontSize: '1.05rem', margin: 0 }}>
                          Student: {req.student.firstName} {req.student.lastName}
                        </h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                          • {req.student.schoolName}{req.student.grade ? ` (${req.student.grade})` : ''}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                        Parent: <strong>{req.parent?.firstName} {req.parent?.lastName}</strong>
                        {req.parent?.phone && ` • Phone: ${req.parent.phone}`}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                        ETB {req.currentPrice.toLocaleString()}/mo
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                        Proposed: ETB {req.proposedPrice.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Route & Pickup Details */}
                  <div style={{ padding: '0.75rem 1rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--color-border)', marginBottom: '0.75rem', fontSize: '0.825rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div><strong>Route:</strong> {req.route.name}</div>
                      <div><strong>Pickup Stop:</strong> {req.pickupStopName}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div><strong>Start Date:</strong> {new Date(req.preferredStartDate).toLocaleDateString()}</div>
                      <div><strong>Applied:</strong> {new Date(req.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>

                  {req.message && (
                    <div style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem', fontStyle: 'italic' }}>
                      Parent Note: "{req.message}"
                    </div>
                  )}

                  {/* Offer History Preview */}
                  {req.offers && req.offers.length > 0 && (
                    <div style={{ marginBottom: '0.75rem', padding: '0.5rem 0.75rem', backgroundColor: '#F1F5F9', borderRadius: '6px', fontSize: '0.8rem' }}>
                      <span style={{ fontWeight: 600 }}>Negotiation History: </span>
                      {req.offers.map((o, idx) => (
                        <span key={o.id || idx}>
                          {idx > 0 && ' ➔ '}
                          {o.senderId === req.parentId ? 'Parent' : 'You'}: ETB {o.amount.toLocaleString()} ({o.status})
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions Bar */}
                  {(req.status === 'PENDING' || req.status === 'NEGOTIATING') && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border-subtle)' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--color-danger)' }}
                        onClick={() => {
                          setRejectModalRequest(req);
                          setRejectReason('');
                        }}
                      >
                        Reject
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setCounterModalRequest(req);
                          setCounterPrice(req.currentPrice);
                          setCounterMessage('');
                        }}
                      >
                        Counter Offer
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleAcceptRequest(req.id)}
                      >
                        <CheckCircle2 size={14} /> Accept & Reserve Seat
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Counter Offer Modal */}
          {counterModalRequest && (
            <div className="modal-backdrop">
              <div className="modal-card">
                <div className="modal-header">
                  <div>
                    <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary)' }}>
                      Submit Counter Offer to Parent
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                      Passenger: {counterModalRequest.student.firstName} • Route: {counterModalRequest.route.name}
                    </p>
                  </div>
                  <button onClick={() => setCounterModalRequest(null)}>
                    <X size={20} />
                  </button>
                </div>

                <div className="modal-body">
                  <div className="filter-group">
                    <label className="filter-label">Proposed Monthly Price (ETB) *</label>
                    <input
                      type="number"
                      className="filter-input"
                      value={counterPrice}
                      onChange={(e) => setCounterPrice(e.target.value ? Number(e.target.value) : '')}
                      placeholder="e.g. 3400"
                      required
                    />
                  </div>

                  <div className="filter-group">
                    <label className="filter-label">Message / Terms for Parent</label>
                    <textarea
                      className="filter-input"
                      rows={2}
                      placeholder="e.g. Includes morning pickup and afternoon school drop-off."
                      value={counterMessage}
                      onChange={(e) => setCounterMessage(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setCounterModalRequest(null)}
                    disabled={isSubmittingCounter}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleSendCounter}
                    disabled={isSubmittingCounter || !counterPrice}
                  >
                    {isSubmittingCounter ? 'Submitting...' : 'Send Counter Offer'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reject Request Modal */}
          {rejectModalRequest && (
            <div className="modal-backdrop">
              <div className="modal-card">
                <div className="modal-header">
                  <div>
                    <h3 style={{ fontSize: '1.15rem', color: 'var(--color-danger)' }}>
                      Decline Seat Request
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                      Student: {rejectModalRequest.student.firstName}
                    </p>
                  </div>
                  <button onClick={() => setRejectModalRequest(null)}>
                    <X size={20} />
                  </button>
                </div>

                <div className="modal-body">
                  <div className="filter-group">
                    <label className="filter-label">Reason for Declining (Optional)</label>
                    <textarea
                      className="filter-input"
                      rows={2}
                      placeholder="e.g. Stop is outside current service boundary, or vehicle full."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setRejectModalRequest(null)}
                    disabled={isRejecting}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ backgroundColor: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                    onClick={handleConfirmReject}
                    disabled={isRejecting}
                  >
                    {isRejecting ? 'Declining...' : 'Confirm Decline'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB: ACTIVE PASSENGERS MANIFEST
          ========================================================================= */}
      {activeTab === 'Passengers' && (
        <div className="panel-card">
          <div className="panel-header">
            <div>
              <h3 className="panel-title">Active Passengers Manifest</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                Official passenger manifest of confirmed students with active agreements
              </p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={fetchPassengers}>
              Refresh
            </button>
          </div>

          {passengersLoading ? (
            <div style={{ textAlign: 'center', padding: '2.5rem' }}>Loading passenger manifest...</div>
          ) : passengers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--color-text-secondary)' }}>
              No active passengers yet. Accept incoming requests to establish student agreements.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>School & Grade</th>
                  <th>Parent / Guardian</th>
                  <th>Pickup Stop</th>
                  <th>Monthly Fee</th>
                  <th>Payment Status</th>
                </tr>
              </thead>
              <tbody>
                {passengers.map((p) => {
                  return (
                    <tr key={p.agreementId}>
                      <td>
                        <strong>{p.student.name}</strong>
                        {p.student.emergencyPhone && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                            Emerg: {p.student.emergencyPhone}
                          </div>
                        )}
                      </td>
                      <td>
                        <div>{p.student.schoolName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                          {p.student.grade || 'N/A'}
                        </div>
                      </td>
                      <td>
                        <div>{p.parent.name}</div>
                        {p.parent.phone && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Phone size={11} /> {p.parent.phone}
                          </div>
                        )}
                      </td>
                      <td>
                        <div>{p.pickupStopName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                          {p.route.name}
                        </div>
                      </td>
                      <td>
                        <strong>ETB {p.monthlyPrice.toLocaleString()}</strong>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '0.2rem 0.5rem',
                              borderRadius: '9999px',
                              color: p.latestPayment?.status === 'APPROVED' || p.latestPayment?.status === 'PAID'
                                ? '#166534'
                                : p.latestPayment?.status === 'PENDING_REVIEW'
                                ? '#B45309'
                                : p.latestPayment?.status === 'REJECTED'
                                ? '#991B1B'
                                : '#475569',
                              backgroundColor: p.latestPayment?.status === 'APPROVED' || p.latestPayment?.status === 'PAID'
                                ? '#DCFCE7'
                                : p.latestPayment?.status === 'PENDING_REVIEW'
                                ? '#FEF3C7'
                                : p.latestPayment?.status === 'REJECTED'
                                ? '#FEE2E2'
                                : '#F1F5F9',
                            }}
                          >
                            {p.latestPayment?.status || 'UNPAID'}
                          </span>
                          {p.latestPayment?.receiptUrl && p.latestPayment?.id && (
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.2rem 0.45rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                              onClick={() => handleOpenProviderReceipt(p.latestPayment!.id!)}
                            >
                              <Eye size={12} /> View Receipt
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Secure Receipt Preview Modal for Provider */}
      {providerReceiptPreviewUrl && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--color-primary)' }}>
                Passenger Payment Receipt Evidence
              </h3>
              <button onClick={closeProviderReceipt}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ textAlign: 'center', padding: '1rem' }}>
              {providerReceiptPreviewMime === 'application/pdf' ? (
                <iframe
                  src={providerReceiptPreviewUrl}
                  style={{ width: '100%', height: '420px', border: '1px solid #E2E8F0', borderRadius: '6px' }}
                  title="Receipt Evidence PDF"
                />
              ) : (
                <img
                  src={providerReceiptPreviewUrl}
                  alt="Passenger Payment Evidence"
                  style={{ maxWidth: '100%', maxHeight: '420px', objectFit: 'contain', borderRadius: '6px', border: '1px solid #E2E8F0' }}
                />
              )}
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary btn-sm" onClick={closeProviderReceipt}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
