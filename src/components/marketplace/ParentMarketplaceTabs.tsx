import { useState, useEffect, FC } from 'react';
import {
  Search,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  X,
  CreditCard,
  Ban,
  Car,
  ChevronRight,
  Info,
  AlertTriangle,
  RotateCcw,
  Star,
} from 'lucide-react';
import {
  searchTransportationApi,
  getStudentsApi,
  createTransportationRequestApi,
  getTransportationRequestsApi,
  counterOfferApi,
  acceptOfferApi,
  getMyAgreementsApi,
  payAgreementApi,
  cancelAgreementApi,
} from '../../services/api';
import {
  TransportationListing,
  TransportationRequest,
  TransportationAgreement,
  Student,
} from '../../types/transportation';

interface ParentMarketplaceTabsProps {
  activeTab: 'Find Transportation' | 'My Requests' | 'My Transportation';
  onNavigateTab: (tab: 'Find Transportation' | 'My Requests' | 'My Transportation') => void;
  user?: any;
  onOpenFaydaModal?: () => void;
}

export const ParentMarketplaceTabs: FC<ParentMarketplaceTabsProps> = ({
  activeTab,
  onNavigateTab,
  user,
  onOpenFaydaModal,
}) => {
  // Discovery & Search State
  const [listings, setListings] = useState<TransportationListing[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [filters, setFilters] = useState({
    school: '',
    schoolBranch: '',
    pickupArea: '',
    vehicleType: '',
    minPrice: '',
    maxPrice: '',
    minSeats: '',
    minRating: '',
    serviceType: '',
    verifiedOnly: false,
  });

  // Selected Route & Modals State
  const [selectedRoute, setSelectedRoute] = useState<TransportationListing | null>(null);
  const [viewingDetailsRoute, setViewingDetailsRoute] = useState<TransportationListing | null>(null);
  const [showVerificationRequiredModal, setShowVerificationRequiredModal] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);

  // Form Fields
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedPickupStopName, setSelectedPickupStopName] = useState('');
  const [preferredStartDate, setPreferredStartDate] = useState('');
  const [proposedPrice, setProposedPrice] = useState<number | ''>('');
  const [requestMessage, setRequestMessage] = useState('');

  // My Requests & Negotiation State
  const [requests, setRequests] = useState<TransportationRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [selectedNegotiationRequest, setSelectedNegotiationRequest] = useState<TransportationRequest | null>(null);
  const [counterAmount, setCounterAmount] = useState<number | ''>('');
  const [counterNote, setCounterNote] = useState('');
  const [submittingCounter, setSubmittingCounter] = useState(false);

  // My Transportation (Agreements) & Payments State
  const [agreements, setAgreements] = useState<TransportationAgreement[]>([]);
  const [agreementsLoading, setAgreementsLoading] = useState(false);
  const [payingAgreement, setPayingAgreement] = useState<TransportationAgreement | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('TELEBIRR_SIMULATED');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [cancellingAgreement, setCancellingAgreement] = useState<TransportationAgreement | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // Load listings on mount or search filter change
  const fetchListings = async () => {
    setSearchLoading(true);
    try {
      const params: any = {};
      if (filters.school.trim()) params.school = filters.school.trim();
      if (filters.schoolBranch.trim()) params.schoolBranch = filters.schoolBranch.trim();
      if (filters.pickupArea.trim()) params.pickupArea = filters.pickupArea.trim();
      if (filters.vehicleType) params.vehicleType = filters.vehicleType;
      if (filters.minPrice) params.minPrice = Number(filters.minPrice);
      if (filters.maxPrice) params.maxPrice = Number(filters.maxPrice);
      if (filters.minSeats) params.minSeats = Number(filters.minSeats);
      if (filters.minRating) params.minRating = Number(filters.minRating);
      if (filters.serviceType) params.serviceType = filters.serviceType;
      if (filters.verifiedOnly) params.verified = true;

      const data = await searchTransportationApi(params);
      setListings(data || []);
    } catch (_err) {
      setListings([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      school: '',
      schoolBranch: '',
      pickupArea: '',
      vehicleType: '',
      minPrice: '',
      maxPrice: '',
      minSeats: '',
      minRating: '',
      serviceType: '',
      verifiedOnly: false,
    };
    setFilters(defaultFilters);
    // Fetch immediately with cleared filters
    setSearchLoading(true);
    searchTransportationApi({})
      .then((data) => setListings(data || []))
      .catch(() => setListings([]))
      .finally(() => setSearchLoading(false));
  };

  const fetchParentRequests = async () => {
    setRequestsLoading(true);
    try {
      const data = await getTransportationRequestsApi();
      setRequests(data || []);
    } catch (_err) {
      setRequests([]);
    } finally {
      setRequestsLoading(false);
    }
  };

  const fetchAgreements = async () => {
    setAgreementsLoading(true);
    try {
      const data = await getMyAgreementsApi();
      setAgreements(data || []);
    } catch (_err) {
      setAgreements([]);
    } finally {
      setAgreementsLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await getStudentsApi();
      setStudents(data || []);
      if (data && data.length > 0 && !selectedStudentId) {
        setSelectedStudentId(data[0].id);
      }
    } catch (_err) {
      // Ignored
    }
  };

  useEffect(() => {
    if (activeTab === 'Find Transportation') {
      fetchListings();
      fetchStudents();
    } else if (activeTab === 'My Requests') {
      fetchParentRequests();
    } else if (activeTab === 'My Transportation') {
      fetchAgreements();
    }
  }, [activeTab]);

  const handleRequestSeatClick = (listing: TransportationListing) => {
    setSelectedRoute(listing);
    if (!user?.isVerified) {
      setShowVerificationRequiredModal(true);
      return;
    }
    handleOpenRequestModal(listing);
  };

  const handleOpenRequestModal = async (listing: TransportationListing) => {
    setSelectedRoute(listing);
    setRequestError(null);
    setRequestSuccess(null);
    setProposedPrice(listing.monthlyPrice);
    if (listing.stops && listing.stops.length > 0) {
      setSelectedPickupStopName(listing.stops[0].name);
    } else {
      setSelectedPickupStopName(listing.origin);
    }
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 7);
    setPreferredStartDate(nextMonth.toISOString().split('T')[0]);

    setIsRequestModalOpen(true);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.isVerified) {
      setIsRequestModalOpen(false);
      setShowVerificationRequiredModal(true);
      return;
    }
    if (!selectedStudentId) {
      setRequestError('Please select a student for this transportation request.');
      return;
    }
    if (!selectedRoute) return;

    setSubmittingRequest(true);
    setRequestError(null);

    try {
      await createTransportationRequestApi({
        studentId: selectedStudentId,
        routeId: selectedRoute.routeId,
        pickupStopName: selectedPickupStopName,
        preferredStartDate: preferredStartDate || new Date().toISOString(),
        proposedPrice: proposedPrice ? Number(proposedPrice) : selectedRoute.monthlyPrice,
        message: requestMessage,
      });

      setRequestSuccess('Transportation seat request submitted! The provider will review your application.');
      setTimeout(() => {
        setIsRequestModalOpen(false);
        onNavigateTab('My Requests');
      }, 1400);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to submit seat request.';
      setRequestError(errMsg);
      if (err.response?.status === 403 && errMsg.toLowerCase().includes('verification')) {
        setTimeout(() => {
          setIsRequestModalOpen(false);
          setShowVerificationRequiredModal(true);
        }, 1500);
      }
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleSendCounterOffer = async () => {
    if (!selectedNegotiationRequest || !counterAmount) return;
    setSubmittingCounter(true);
    try {
      await counterOfferApi(
        selectedNegotiationRequest.id,
        Number(counterAmount),
        counterNote || undefined
      );
      setCounterAmount('');
      setCounterNote('');
      fetchParentRequests();
      // Update modal request if open
      const updated = await getTransportationRequestsApi();
      const match = updated.find((r: any) => r.id === selectedNegotiationRequest.id);
      if (match) setSelectedNegotiationRequest(match);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit counter offer');
    } finally {
      setSubmittingCounter(false);
    }
  };

  const handleAcceptOffer = async (requestId: string) => {
    try {
      await acceptOfferApi(requestId);
      fetchParentRequests();
      if (selectedNegotiationRequest && selectedNegotiationRequest.id === requestId) {
        setSelectedNegotiationRequest(null);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to accept offer');
    }
  };

  const handleProcessPayment = async () => {
    if (!payingAgreement) return;
    setIsProcessingPayment(true);
    try {
      await payAgreementApi(payingAgreement.id, paymentMethod);
      setPayingAgreement(null);
      fetchAgreements();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Payment simulation failed');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleConfirmCancellation = async () => {
    if (!cancellingAgreement) return;
    setIsCancelling(true);
    try {
      await cancelAgreementApi(cancellingAgreement.id, cancellationReason);
      setCancellingAgreement(null);
      setCancellationReason('');
      fetchAgreements();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Cancellation failed');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div>
      {/* =========================================================================
          TAB 1: FIND TRANSPORTATION
          ========================================================================= */}
      {activeTab === 'Find Transportation' && (
        <>
          {/* Marketplace Filter Bar */}
          <div className="marketplace-filter-bar">
            <div className="filter-group">
              <label className="filter-label">School Destination</label>
              <input
                type="text"
                className="filter-input"
                placeholder="e.g. Cambridge Academy"
                value={filters.school}
                onChange={(e) => setFilters({ ...filters, school: e.target.value })}
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">School Branch</label>
              <input
                type="text"
                className="filter-input"
                placeholder="e.g. Ayder, Bole, Main"
                value={filters.schoolBranch}
                onChange={(e) => setFilters({ ...filters, schoolBranch: e.target.value })}
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">Pickup Neighborhood</label>
              <input
                type="text"
                className="filter-input"
                placeholder="e.g. Ayder, Kazanchis, CMC"
                value={filters.pickupArea}
                onChange={(e) => setFilters({ ...filters, pickupArea: e.target.value })}
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">Vehicle Type</label>
              <select
                className="filter-input"
                value={filters.vehicleType}
                onChange={(e) => setFilters({ ...filters, vehicleType: e.target.value })}
              >
                <option value="">All Vehicles</option>
                <option value="Minibus">Minibus (HiAce / Minivan)</option>
                <option value="Van">Van / Coaster</option>
                <option value="Bus">School Bus</option>
                <option value="Sedan">Sedan / Compact</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Min Price (ETB)</label>
              <input
                type="number"
                className="filter-input"
                placeholder="Min ETB"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">Max Price (ETB)</label>
              <input
                type="number"
                className="filter-input"
                placeholder="Max ETB"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">Available Seats</label>
              <select
                className="filter-input"
                value={filters.minSeats}
                onChange={(e) => setFilters({ ...filters, minSeats: e.target.value })}
              >
                <option value="">Any Available</option>
                <option value="1">1+ Seats</option>
                <option value="2">2+ Seats</option>
                <option value="3">3+ Seats</option>
                <option value="5">5+ Seats</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Provider Rating</label>
              <select
                className="filter-input"
                value={filters.minRating}
                onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
              >
                <option value="">Any Rating</option>
                <option value="4.0">4.0+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4.8">4.8+ Stars</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Schedule</label>
              <select
                className="filter-input"
                value={filters.serviceType}
                onChange={(e) => setFilters({ ...filters, serviceType: e.target.value })}
              >
                <option value="">All Services</option>
                <option value="BOTH">Morning & Afternoon</option>
                <option value="MORNING">Morning Only</option>
                <option value="AFTERNOON">Afternoon Only</option>
              </select>
            </div>

            <div className="filter-group" style={{ justifyContent: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.825rem', fontWeight: 600, cursor: 'pointer', color: 'var(--color-text-main)' }}>
                <input
                  type="checkbox"
                  checked={filters.verifiedOnly}
                  onChange={(e) => setFilters({ ...filters, verifiedOnly: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }}
                />
                Verified Providers Only
              </label>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', gridColumn: 'span 2' }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1, gap: '0.4rem', justifyContent: 'center' }}
                onClick={fetchListings}
              >
                <Search size={16} /> Search Routes
              </button>
              <button
                className="btn btn-secondary"
                style={{ gap: '0.4rem', justifyContent: 'center' }}
                onClick={handleResetFilters}
                title="Reset all filters"
              >
                <RotateCcw size={15} /> Reset
              </button>
            </div>
          </div>

          {/* Transportation Listings Grid */}
          {searchLoading ? (
            <div className="panel-card" style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                Searching verified school transportation options...
              </div>
            </div>
          ) : listings.length === 0 ? (
            <div className="panel-card" style={{ textAlign: 'center', padding: '3rem' }}>
              <Info size={36} style={{ color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }} />
              <h4 style={{ color: 'var(--color-primary)' }}>No transportation options found</h4>
              <p style={{ maxWidth: '460px', margin: '0.5rem auto 1.5rem', color: 'var(--color-text-secondary)' }}>
                No active routes match your search filters. Try adjusting your destination school, pickup neighborhood, or clearing the filters.
              </p>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleResetFilters}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="marketplace-grid">
              {listings.map((item) => (
                <div key={item.routeId} className="marketplace-card">
                  {/* Card Header */}
                  <div className="marketplace-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--color-primary)',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                        }}
                      >
                        {item.provider.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-main)' }}>
                          {item.provider.name}
                        </div>
                        {item.provider.isVerified ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                              fontSize: '0.725rem',
                              fontWeight: 700,
                              color: 'var(--color-success)',
                              backgroundColor: 'var(--color-success-light)',
                              padding: '0.15rem 0.45rem',
                              borderRadius: 'var(--radius-full)',
                            }}
                          >
                            <ShieldCheck size={12} /> Verified Provider
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              fontSize: '0.725rem',
                              color: 'var(--color-text-secondary)',
                            }}
                          >
                            Transport Provider
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end', fontSize: '0.85rem', fontWeight: 700, color: '#D97706' }}>
                        ★ {item.averageRating ? item.averageRating.toFixed(1) : '5.0'}
                      </div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--color-text-secondary)' }}>
                        {item.completedTrips} trips
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="marketplace-card-body">
                    <div>
                      <h4 style={{ fontSize: '1rem', color: 'var(--color-primary)', marginBottom: '0.25rem' }}>
                        {item.routeName}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem', color: 'var(--color-text-secondary)' }}>
                        <MapPin size={14} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
                        <span>
                          To <strong>{item.destinationSchool}</strong>
                          {item.schoolBranch ? ` (${item.schoolBranch} Branch)` : ''}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                        From: {item.origin}
                      </div>
                    </div>

                    {/* Vehicle & Seats Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem' }}>
                        <Car size={16} style={{ color: 'var(--color-primary)' }} />
                        <div>
                          <div style={{ fontWeight: 600 }}>{item.vehicle.model}</div>
                          <div style={{ fontSize: '0.725rem', color: 'var(--color-text-secondary)' }}>
                            Plate: {item.vehicle.plateNumber}
                            {item.vehicle.isVerified && (
                              <span style={{ marginLeft: '0.35rem', color: 'var(--color-success)', fontWeight: 600 }}>✓ Inspected</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: item.availableSeats > 2 ? 'var(--color-success)' : item.availableSeats > 0 ? 'var(--color-warning)' : 'var(--color-danger)' }}>
                          {item.availableSeats > 0 ? `${item.availableSeats} Seats Left` : 'Fully Booked'}
                        </span>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>
                          Cap: {item.capacity}
                        </div>
                      </div>
                    </div>

                    {/* Schedule times & Stops Preview */}
                    <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-text-secondary)' }}>
                        <Clock size={13} />
                        <span>
                          {item.departureTimeMorning ? `Morning: ${item.departureTimeMorning}` : ''}
                          {item.departureTimeAfternoon ? ` • Afternoon: ${item.departureTimeAfternoon}` : ''}
                        </span>
                      </div>
                      {item.stops && item.stops.length > 0 && (
                        <div style={{ color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span style={{ fontWeight: 600 }}>Stops:</span>
                          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {item.stops.map((s) => s.name).join(' ➔ ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="marketplace-card-footer">
                    <div className="price-tag">
                      <span className="price-amount">ETB {item.monthlyPrice.toLocaleString()}</span>
                      <span className="price-period">per month</span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setViewingDetailsRoute(item)}
                      >
                        View Details
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        disabled={item.availableSeats <= 0}
                        onClick={() => handleRequestSeatClick(item)}
                      >
                        {item.availableSeats > 0 ? 'Request Seat' : 'Full'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Dedicated Route & Provider Details Modal */}
          {viewingDetailsRoute && (
            <div className="modal-backdrop">
              <div className="modal-card" style={{ maxWidth: '600px', width: '92%' }}>
                <div className="modal-header">
                  <div>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--color-primary)', margin: 0 }}>
                      {viewingDetailsRoute.routeName}
                    </h3>
                    <p style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', margin: '0.2rem 0 0' }}>
                      To {viewingDetailsRoute.destinationSchool}
                      {viewingDetailsRoute.schoolBranch ? ` (${viewingDetailsRoute.schoolBranch} Branch)` : ''}
                    </p>
                  </div>
                  <button onClick={() => setViewingDetailsRoute(null)} style={{ color: 'var(--color-text-muted)' }}>
                    <X size={20} />
                  </button>
                </div>

                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Provider & Verification Section */}
                  <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-primary)',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '1.1rem',
                        }}
                      >
                        {viewingDetailsRoute.provider.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--color-text-main)', fontSize: '0.95rem' }}>
                          {viewingDetailsRoute.provider.name}
                        </div>
                        {viewingDetailsRoute.provider.isVerified ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-success)' }}>
                            <ShieldCheck size={14} /> Fayda & Background Verified Provider
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                            Standard Transport Provider
                          </div>
                        )}
                        {viewingDetailsRoute.provider.phone && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                            Contact: {viewingDetailsRoute.provider.phone}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end', fontWeight: 700, color: '#D97706' }}>
                        <Star size={15} fill="#D97706" /> {viewingDetailsRoute.averageRating ? viewingDetailsRoute.averageRating.toFixed(1) : '5.0'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                        {viewingDetailsRoute.completedTrips} school trips completed
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Details */}
                  <div>
                    <h5 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', letterSpacing: '0.03em' }}>
                      Vehicle & Safety Specifications
                    </h5>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                      <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                        <div style={{ fontSize: '0.725rem', color: 'var(--color-text-secondary)' }}>Model</div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{viewingDetailsRoute.vehicle.model}</div>
                      </div>
                      <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                        <div style={{ fontSize: '0.725rem', color: 'var(--color-text-secondary)' }}>Plate Number</div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{viewingDetailsRoute.vehicle.plateNumber}</div>
                      </div>
                      <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                        <div style={{ fontSize: '0.725rem', color: 'var(--color-text-secondary)' }}>Capacity / Seats</div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: viewingDetailsRoute.availableSeats > 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                          {viewingDetailsRoute.availableSeats} of {viewingDetailsRoute.capacity} available
                        </div>
                      </div>
                      <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                        <div style={{ fontSize: '0.725rem', color: 'var(--color-text-secondary)' }}>Vehicle Inspection</div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: viewingDetailsRoute.vehicle.isVerified ? 'var(--color-success)' : 'var(--color-text-secondary)' }}>
                          {viewingDetailsRoute.vehicle.isVerified ? '✓ Verified Safe' : 'Pending Inspection'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Route Schedule & Timeline */}
                  <div>
                    <h5 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', letterSpacing: '0.03em' }}>
                      Schedule & Stops Timeline
                    </h5>
                    <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem' }}>
                        <span><strong>Service Type:</strong> {viewingDetailsRoute.serviceType}</span>
                        <span><strong>Origin:</strong> {viewingDetailsRoute.origin}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.825rem', color: 'var(--color-text-secondary)' }}>
                        {viewingDetailsRoute.departureTimeMorning && (
                          <span>Morning Departure: <strong>{viewingDetailsRoute.departureTimeMorning}</strong></span>
                        )}
                        {viewingDetailsRoute.departureTimeAfternoon && (
                          <span>Afternoon Pickup: <strong>{viewingDetailsRoute.departureTimeAfternoon}</strong></span>
                        )}
                      </div>

                      {viewingDetailsRoute.stops && viewingDetailsRoute.stops.length > 0 && (
                        <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.4rem' }}>
                            Designated Stops on Route:
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            {viewingDetailsRoute.stops.map((stop, sIdx) => (
                              <div key={stop.id || sIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem' }}>
                                <span style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: '#fff', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  {sIdx + 1}
                                </span>
                                <span style={{ fontWeight: 600 }}>{stop.name}</span>
                                {stop.pickupTimeMorning && (
                                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                    (AM: {stop.pickupTimeMorning})
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Monthly Pricing Summary */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', backgroundColor: 'var(--color-primary-light, #EFF6FF)', borderRadius: '8px' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Standard Monthly Fare</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                        ETB {viewingDetailsRoute.monthlyPrice.toLocaleString()} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>/ month</span>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textAlign: 'right' }}>
                      Price can be negotiated<br />during request submission
                    </div>
                  </div>
                </div>

                <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setViewingDetailsRoute(null)}
                  >
                    Close
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={viewingDetailsRoute.availableSeats <= 0}
                    onClick={() => {
                      const route = viewingDetailsRoute;
                      setViewingDetailsRoute(null);
                      handleRequestSeatClick(route);
                    }}
                  >
                    {viewingDetailsRoute.availableSeats > 0 ? 'Request Transportation Seat' : 'Route Full'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Identity Verification Prompt Modal */}
          {showVerificationRequiredModal && (
            <div className="modal-backdrop">
              <div className="modal-card" style={{ maxWidth: '480px', width: '92%' }}>
                <div className="modal-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AlertTriangle size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', color: 'var(--color-primary)', margin: 0 }}>
                        Fayda ID Verification Required
                      </h3>
                      <p style={{ fontSize: '0.775rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                        Ethiopian National Digital ID Safeguard
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setShowVerificationRequiredModal(false)} style={{ color: 'var(--color-text-muted)' }}>
                    <X size={20} />
                  </button>
                </div>

                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
                  <p style={{ color: 'var(--color-text-main)', margin: 0, lineHeight: 1.5 }}>
                    Under Ethiopian student transportation safety regulations and SchoolSafe security policy, all parents must verify their identity using their <strong>Ethiopian Fayda National Digital ID (FIN or Fayda eSignet)</strong> before submitting seat requests.
                  </p>

                  {selectedRoute && (
                    <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.825rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>Selected Route:</div>
                      <div>{selectedRoute.routeName} → {selectedRoute.destinationSchool}</div>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.75rem', backgroundColor: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0', color: '#166534', fontSize: '0.8rem' }}>
                    <ShieldCheck size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>
                      Verification takes less than 60 seconds with your 12-digit Fayda FIN or Fayda eSignet login. Once verified, you can book routes instantly.
                    </span>
                  </div>
                </div>

                <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowVerificationRequiredModal(false)}
                  >
                    Browse More First
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setShowVerificationRequiredModal(false);
                      if (onOpenFaydaModal) {
                        onOpenFaydaModal();
                      }
                    }}
                  >
                    Verify Fayda ID Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Route Details & Request Seat Modal */}
          {isRequestModalOpen && selectedRoute && (
            <div className="modal-backdrop">
              <div className="modal-card">
                <div className="modal-header">
                  <div>
                    <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary)' }}>
                      Request Transportation Seat
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                      {selectedRoute.routeName}
                    </p>
                  </div>
                  <button onClick={() => setIsRequestModalOpen(false)} style={{ color: 'var(--color-text-muted)' }}>
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmitRequest}>
                  <div className="modal-body">
                    {requestError && (
                      <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger)', borderRadius: '8px', fontSize: '0.85rem' }}>
                        {requestError}
                      </div>
                    )}
                    {requestSuccess && (
                      <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle2 size={16} /> {requestSuccess}
                      </div>
                    )}

                    {/* Route Summary Card */}
                    <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>Destination School:</span>
                        <span style={{ fontWeight: 600 }}>
                          {selectedRoute.destinationSchool}
                          {selectedRoute.schoolBranch ? ` (${selectedRoute.schoolBranch} Branch)` : ''}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>Vehicle & Driver:</span>
                        <span style={{ fontWeight: 600 }}>{selectedRoute.vehicle.model} ({selectedRoute.vehicle.plateNumber}) • {selectedRoute.provider.name}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>Standard Fee:</span>
                        <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>ETB {selectedRoute.monthlyPrice.toLocaleString()}/month</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>Available Capacity:</span>
                        <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>{selectedRoute.availableSeats} of {selectedRoute.capacity} seats left</span>
                      </div>
                    </div>

                    {/* Select Student / Child */}
                    <div className="filter-group">
                      <label className="filter-label">Select Student (Child) *</label>
                      {students.length === 0 ? (
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', padding: '0.5rem', border: '1px dashed var(--color-border)', borderRadius: '6px' }}>
                          No students registered yet. Please register your child under "My Children" tab first.
                        </div>
                      ) : (
                        <select
                          className="filter-input"
                          value={selectedStudentId}
                          onChange={(e) => setSelectedStudentId(e.target.value)}
                          required
                        >
                          {students.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.firstName} {s.lastName} ({s.schoolName}{s.grade ? ` - ${s.grade}` : ''})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Select Pickup Stop */}
                    <div className="filter-group">
                      <label className="filter-label">Pickup Stop Location *</label>
                      {selectedRoute.stops && selectedRoute.stops.length > 0 ? (
                        <select
                          className="filter-input"
                          value={selectedPickupStopName}
                          onChange={(e) => setSelectedPickupStopName(e.target.value)}
                          required
                        >
                          {selectedRoute.stops.map((stop) => (
                            <option key={stop.id} value={stop.name}>
                              {stop.name} {stop.pickupTimeMorning ? `(${stop.pickupTimeMorning})` : ''}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          className="filter-input"
                          value={selectedPickupStopName}
                          onChange={(e) => setSelectedPickupStopName(e.target.value)}
                          placeholder="e.g. Ayder Gate, House #14"
                          required
                        />
                      )}
                    </div>

                    {/* Preferred Start Date & Negotiation Offer */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="filter-group">
                        <label className="filter-label">Preferred Start Date</label>
                        <input
                          type="date"
                          className="filter-input"
                          value={preferredStartDate}
                          onChange={(e) => setPreferredStartDate(e.target.value)}
                          required
                        />
                      </div>

                      <div className="filter-group">
                        <label className="filter-label">Proposed Price (ETB / Mo)</label>
                        <input
                          type="number"
                          className="filter-input"
                          value={proposedPrice}
                          onChange={(e) => setProposedPrice(e.target.value ? Number(e.target.value) : '')}
                          placeholder={`Default: ${selectedRoute.monthlyPrice}`}
                        />
                      </div>
                    </div>

                    {/* Optional Message */}
                    <div className="filter-group">
                      <label className="filter-label">Message for Provider (Optional)</label>
                      <textarea
                        className="filter-input"
                        rows={2}
                        placeholder="e.g. Pickup preferred at 7:15 AM sharp near main road."
                        value={requestMessage}
                        onChange={(e) => setRequestMessage(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setIsRequestModalOpen(false)}
                      disabled={submittingRequest}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm"
                      disabled={submittingRequest || students.length === 0}
                    >
                      {submittingRequest ? 'Submitting...' : 'Submit Seat Request'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {/* =========================================================================
          TAB 2: MY REQUESTS & NEGOTIATION
          ========================================================================= */}
      {activeTab === 'My Requests' && (
        <div className="panel-card">
          <div className="panel-header">
            <div>
              <h3 className="panel-title">My Transportation Requests & Price Negotiations</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                Track request review status, counter-offers, and agreed prices with transport providers
              </p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={fetchParentRequests}>
              Refresh
            </button>
          </div>

          {requestsLoading ? (
            <div style={{ textAlign: 'center', padding: '2.5rem' }}>Loading seat requests...</div>
          ) : requests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem' }}>
              <p style={{ marginBottom: '1rem' }}>You have not submitted any transportation requests yet.</p>
              <button className="btn btn-primary btn-sm" onClick={() => onNavigateTab('Find Transportation')}>
                Find Transportation
              </button>
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
                    backgroundColor: req.status === 'ACCEPTED' ? '#F0FDF4' : '#FFFFFF',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h4 style={{ color: 'var(--color-primary)', fontSize: '1.05rem', margin: 0 }}>
                          {req.student.firstName} {req.student.lastName}
                        </h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                          • {req.route.destinationSchool}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                        Route: <strong>{req.route.name}</strong> • Stop: <strong>{req.pickupStopName}</strong>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span
                        className={`badge-status ${
                          req.status === 'ACCEPTED' ? 'active' : req.status === 'PENDING' ? 'pending' : 'resolved'
                        }`}
                      >
                        {req.status}
                      </span>
                      <div style={{ fontWeight: 700, color: 'var(--color-primary)', marginTop: '0.25rem' }}>
                        Current: ETB {req.currentPrice.toLocaleString()}/mo
                      </div>
                    </div>
                  </div>

                  {/* Negotiation Offer History Preview */}
                  {req.offers && req.offers.length > 0 && (
                    <div style={{ marginBottom: '0.75rem', padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                        Offer Thread ({req.offers.length} {req.offers.length === 1 ? 'offer' : 'offers'})
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.825rem' }}>
                        {req.offers.map((offer, idx) => (
                          <div key={offer.id || idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>
                              {offer.senderId === req.parentId ? 'You offered' : 'Provider countered'}:{' '}
                              <strong>ETB {offer.amount.toLocaleString()}</strong>
                              {offer.message ? ` — "${offer.message}"` : ''}
                            </span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: offer.status === 'ACCEPTED' ? 'var(--color-success)' : 'var(--color-text-secondary)' }}>
                              {offer.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border-subtle)' }}>
                    <div style={{ fontSize: '0.775rem', color: 'var(--color-text-secondary)' }}>
                      Requested on {new Date(req.createdAt).toLocaleDateString()}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {(req.status === 'PENDING' || req.status === 'NEGOTIATING') && (
                        <>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setSelectedNegotiationRequest(req)}
                          >
                            Counter-Offer
                          </button>
                          {req.offers.length > 0 &&
                            req.offers[req.offers.length - 1].senderId !== req.parentId &&
                            req.offers[req.offers.length - 1].status === 'PENDING' && (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleAcceptOffer(req.id)}
                              >
                                Accept ETB {req.offers[req.offers.length - 1].amount.toLocaleString()}
                              </button>
                            )}
                        </>
                      )}

                      {req.status === 'ACCEPTED' && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => onNavigateTab('My Transportation')}
                        >
                          View Agreement & Pay <ChevronRight size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Counter-Offer Negotiation Modal */}
          {selectedNegotiationRequest && (
            <div className="modal-backdrop">
              <div className="modal-card">
                <div className="modal-header">
                  <div>
                    <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary)' }}>
                      Submit Price Counter-Offer
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                      Route: {selectedNegotiationRequest.route.name}
                    </p>
                  </div>
                  <button onClick={() => setSelectedNegotiationRequest(null)}>
                    <X size={20} />
                  </button>
                </div>

                <div className="modal-body">
                  <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}>
                    <div>Current Active Price: <strong>ETB {selectedNegotiationRequest.currentPrice.toLocaleString()}/month</strong></div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                      All negotiation offers are permanently saved in the immutable history.
                    </div>
                  </div>

                  <div className="filter-group">
                    <label className="filter-label">Your Proposed Monthly Price (ETB) *</label>
                    <input
                      type="number"
                      className="filter-input"
                      placeholder="e.g. 3300"
                      value={counterAmount}
                      onChange={(e) => setCounterAmount(e.target.value ? Number(e.target.value) : '')}
                      required
                    />
                  </div>

                  <div className="filter-group">
                    <label className="filter-label">Optional Note</label>
                    <textarea
                      className="filter-input"
                      rows={2}
                      placeholder="e.g. Offering ETB 3,300 for 5-day morning & afternoon pickup."
                      value={counterNote}
                      onChange={(e) => setCounterNote(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedNegotiationRequest(null)}
                    disabled={submittingCounter}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleSendCounterOffer}
                    disabled={submittingCounter || !counterAmount}
                  >
                    {submittingCounter ? 'Submitting...' : 'Send Counter-Offer'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: MY TRANSPORTATION (ACTIVE AGREEMENTS & PAYMENTS)
          ========================================================================= */}
      {activeTab === 'My Transportation' && (
        <div className="panel-card">
          <div className="panel-header">
            <div>
              <h3 className="panel-title">My Child's Transportation & Binding Agreements</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                Confirmed binding contracts locking agreed prices, route assignments, and billing records
              </p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={fetchAgreements}>
              Refresh
            </button>
          </div>

          {agreementsLoading ? (
            <div style={{ textAlign: 'center', padding: '2.5rem' }}>Loading active agreements...</div>
          ) : agreements.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem' }}>
              <p style={{ marginBottom: '1rem' }}>No transportation agreements established yet.</p>
              <button className="btn btn-primary btn-sm" onClick={() => onNavigateTab('Find Transportation')}>
                Find Transportation
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {agreements.map((agreement) => {
                const latestPayment = agreement.payments && agreement.payments[0];
                const isPaid = latestPayment?.status === 'PAID';

                return (
                  <div
                    key={agreement.id}
                    style={{
                      padding: '1.5rem',
                      border: '1px solid var(--color-border)',
                      borderRadius: '10px',
                      backgroundColor: agreement.status === 'ACTIVE' ? '#FFFFFF' : '#F8FAFC',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <h4 style={{ color: 'var(--color-primary)', fontSize: '1.15rem' }}>
                            Student: {agreement.student.firstName} {agreement.student.lastName}
                          </h4>
                          <span
                            className={`badge-status ${agreement.status === 'ACTIVE' ? 'active' : 'resolved'}`}
                          >
                            {agreement.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                          School: <strong>{agreement.student.schoolName}</strong> • Agreement #{agreement.id.slice(0, 8)}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                          ETB {agreement.monthlyPrice.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                          Locked Monthly Fee
                        </div>
                      </div>
                    </div>

                    {/* Agreement Details Grid */}
                    <div className="grid-2" style={{ marginBottom: '1.25rem', gap: '1rem' }}>
                      <div style={{ padding: '0.85rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <div><strong>Route:</strong> {agreement.route.name}</div>
                        <div><strong>Pickup Stop:</strong> {agreement.pickupStopName}</div>
                        <div><strong>Schedule:</strong> {agreement.route.departureTimeMorning || '07:15 AM'} (Morning) • {agreement.route.departureTimeAfternoon || '03:30 PM'} (Afternoon)</div>
                      </div>

                      <div style={{ padding: '0.85rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <div><strong>Vehicle:</strong> {agreement.vehicle.make} {agreement.vehicle.model} ({agreement.vehicle.plateNumber})</div>
                        <div><strong>Provider:</strong> {agreement.provider.firstName} {agreement.provider.lastName} {agreement.provider.phone ? `(${agreement.provider.phone})` : ''}</div>
                        <div>
                          <strong>Payment Status:</strong>{' '}
                          <span style={{ fontWeight: 700, color: isPaid ? 'var(--color-success)' : 'var(--color-warning)' }}>
                            {isPaid ? 'PAID' : 'PENDING'}
                          </span>
                          {latestPayment && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                              {' '}• Ref: {latestPayment.reference}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', alignItems: 'center' }}>
                      {agreement.status === 'ACTIVE' && (
                        <>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ color: 'var(--color-danger)' }}
                            onClick={() => setCancellingAgreement(agreement)}
                          >
                            <Ban size={14} /> Cancel Agreement
                          </button>

                          {!isPaid ? (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => setPayingAgreement(agreement)}
                            >
                              <CreditCard size={14} /> Pay Transportation Fee
                            </button>
                          ) : (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                color: 'var(--color-success)',
                                backgroundColor: 'var(--color-success-light)',
                                padding: '0.35rem 0.75rem',
                                borderRadius: 'var(--radius-full)',
                              }}
                            >
                              <CheckCircle2 size={14} /> Paid for Current Month
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Simulated Payment Modal */}
          {payingAgreement && (
            <div className="modal-backdrop">
              <div className="modal-card">
                <div className="modal-header">
                  <div>
                    <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary)' }}>
                      Pay Transportation Fee
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                      Agreement #{payingAgreement.id.slice(0, 8)} • {payingAgreement.student.firstName}
                    </p>
                  </div>
                  <button onClick={() => setPayingAgreement(null)}>
                    <X size={20} />
                  </button>
                </div>

                <div className="modal-body">
                  <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Amount Due</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: '0.25rem' }}>
                      ETB {payingAgreement.monthlyPrice.toLocaleString()}
                    </div>
                  </div>

                  <div className="filter-group">
                    <label className="filter-label">Select Payment Method (Simulation)</label>
                    <select
                      className="filter-input"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="TELEBIRR_SIMULATED">Telebirr (Simulated)</option>
                      <option value="CBE_BIRR_SIMULATED">CBE Birr (Simulated)</option>
                      <option value="SIMULATED_TRANSFER">Bank Direct Transfer</option>
                    </select>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                    * In this release, payment execution is simulated. A permanent transaction ledger record with unique reference code will be generated upon confirmation.
                  </p>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setPayingAgreement(null)}
                    disabled={isProcessingPayment}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleProcessPayment}
                    disabled={isProcessingPayment}
                  >
                    {isProcessingPayment ? 'Processing...' : 'Confirm Simulated Payment'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Cancel Agreement Modal */}
          {cancellingAgreement && (
            <div className="modal-backdrop">
              <div className="modal-card">
                <div className="modal-header">
                  <div>
                    <h3 style={{ fontSize: '1.15rem', color: 'var(--color-danger)' }}>
                      Cancel Transportation Agreement
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                      Student: {cancellingAgreement.student.firstName} {cancellingAgreement.student.lastName}
                    </p>
                  </div>
                  <button onClick={() => setCancellingAgreement(null)}>
                    <X size={20} />
                  </button>
                </div>

                <div className="modal-body">
                  <div style={{ padding: '0.75rem', backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger)', borderRadius: '8px', fontSize: '0.85rem' }}>
                    Cancelling this agreement will immediately release the reserved seat (+1 available seat) back to the route manifest and terminate ongoing transit services.
                  </div>

                  <div className="filter-group">
                    <label className="filter-label">Reason for Cancellation</label>
                    <textarea
                      className="filter-input"
                      rows={2}
                      placeholder="e.g. Relocating, changed school schedule..."
                      value={cancellationReason}
                      onChange={(e) => setCancellationReason(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setCancellingAgreement(null)}
                    disabled={isCancelling}
                  >
                    Keep Agreement
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ backgroundColor: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                    onClick={handleConfirmCancellation}
                    disabled={isCancelling}
                  >
                    {isCancelling ? 'Cancelling...' : 'Confirm Seat Release'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
