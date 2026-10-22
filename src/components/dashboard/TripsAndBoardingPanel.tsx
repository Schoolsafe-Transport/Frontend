import { useState, useEffect, FC } from 'react';
import {
  Bus,
  CheckCircle2,
  MapPin,
  Play,
  Check,
  Plus,
  ShieldCheck,
  Radio,
  QrCode,
} from 'lucide-react';
import {
  getTripsApi,
  createTripApi,
  updateTripStatusApi,
  getTripPassengersApi,
  recordBoardingApi,
  scanStudentPassApi,
  getProviderRoutesApi,
} from '../../services/api';
import { getSocket } from '../../services/socket';

export const TripsAndBoardingPanel: FC<{ user?: any; isParent?: boolean }> = ({
  isParent = false,
}) => {
  const [trips, setTrips] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [passengers, setPassengers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [passengersLoading, setPassengersLoading] = useState<boolean>(false);
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // New Trip Form
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [tripType, setTripType] = useState<string>('MORNING');
  const [tripNotes, setTripNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // QR SafePass Scanner State (Task 4 & 5)
  const [showQrScanModal, setShowQrScanModal] = useState<boolean>(false);
  const [qrTokenInput, setQrTokenInput] = useState<string>('');
  const [scanEventType, setScanEventType] = useState<'BOARDED' | 'ARRIVED_AT_SCHOOL' | 'BOARDED_FOR_RETURN' | 'DROPPED_OFF'>('BOARDED');
  const [scanStopInput, setScanStopInput] = useState<string>('');
  const [scanning, setScanning] = useState<boolean>(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<any | null>(null);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const data = await getTripsApi();
      setTrips(data || []);
      if (data && data.length > 0 && !selectedTripId) {
        setSelectedTripId(data[0].id);
      }
    } catch (_err) {
      // Catch
    } finally {
      setLoading(false);
    }
  };

  const fetchRoutes = async () => {
    if (isParent) return;
    try {
      const data = await getProviderRoutesApi();
      setRoutes(data || []);
      if (data && data.length > 0) {
        setSelectedRouteId(data[0].id);
      }
    } catch (_err) {
      // Catch
    }
  };

  useEffect(() => {
    fetchTrips();
    fetchRoutes();
  }, []);

  // Fetch passengers when a trip is selected
  useEffect(() => {
    if (!selectedTripId) return;

    const loadPassengers = async () => {
      try {
        setPassengersLoading(true);
        const data = await getTripPassengersApi(selectedTripId);
        setPassengers(data || []);
      } catch (_err) {
        // Catch
      } finally {
        setPassengersLoading(false);
      }
    };

    loadPassengers();

    // Listen to trip room socket events
    try {
      const socket = getSocket();
      if (!socket.connected) {
        socket.connect();
      }
      socket.emit('join_trip', selectedTripId);

      const handleBoarding = () => {
        loadPassengers();
      };

      socket.on('student:boarding_event', handleBoarding);
      socket.on('trip_status_changed', fetchTrips);

      return () => {
        socket.emit('leave_trip', selectedTripId);
        socket.off('student:boarding_event', handleBoarding);
        socket.off('trip_status_changed', fetchTrips);
      };
    } catch (_err) {
      // Catch
    }
  }, [selectedTripId]);

  const handleStatusChange = async (tripId: string, status: string) => {
    try {
      setActionError(null);
      await updateTripStatusApi(tripId, status);
      setActionSuccess(`Trip transit run status updated to ${status}.`);
      fetchTrips();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to update trip status');
    }
  };

  const handleRecordBoarding = async (
    tripId: string,
    studentId: string,
    studentName: string,
    eventType: 'BOARDED' | 'DROPPED_OFF'
  ) => {
    try {
      setActionError(null);
      await recordBoardingApi(tripId, {
        studentId,
        eventType,
      });

      const label = eventType === 'BOARDED' ? 'checked in & boarded' : 'safely dropped off';
      setActionSuccess(`${studentName} successfully recorded as ${label}! Notification dispatched to parent.`);

      // Update local passenger list
      setPassengers((prev) =>
        prev.map((p) =>
          p.studentId === studentId
            ? { ...p, status: eventType === 'BOARDED' ? 'BOARDED' : 'DROPPED_OFF' }
            : p
        )
      );

      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to record student boarding');
    }
  };

  const handleScanPass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTripId || !qrTokenInput.trim()) {
      setScanError('Please enter or scan a valid QR pass token');
      return;
    }
    try {
      setScanning(true);
      setScanError(null);
      setScanResult(null);
      const res = await scanStudentPassApi(selectedTripId, {
        qrToken: qrTokenInput.trim(),
        eventType: scanEventType,
        scannedStop: scanStopInput.trim() || undefined,
      });
      setScanResult(res.data);
      setActionSuccess(res.message);

      // Refresh passengers with authoritative data
      const updated = await getTripPassengersApi(selectedTripId);
      setPassengers(updated || []);

      setTimeout(() => {
        setShowQrScanModal(false);
        setScanResult(null);
        setQrTokenInput('');
        setScanStopInput('');
      }, 2500);
    } catch (err: any) {
      setScanError(err.response?.data?.message || 'QR token verification failed');
    } finally {
      setScanning(false);
    }
  };

  const handleScheduleTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    const route = routes.find((r) => r.id === selectedRouteId);
    if (!route) {
      setActionError('Please select a route');
      return;
    }

    try {
      setSubmitting(true);
      setActionError(null);
      const newTrip = await createTripApi({
        routeId: selectedRouteId,
        vehicleId: route.vehicleId,
        tripType,
        notes: tripNotes || undefined,
      });

      setActionSuccess('Transit run scheduled successfully with enrolled passengers assigned!');
      setShowScheduleModal(false);
      fetchTrips();
      setSelectedTripId(newTrip.id);
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to schedule trip');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedTrip = trips.find((t) => t.id === selectedTripId);

  return (
    <div className="panel-card">
      <div className="panel-header">
        <div>
          <h3 className="panel-title">Daily Trip Control & Student Boarding</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
            Active schedule, live student boarding check-in, and parental safety notifications
          </p>
        </div>

        {!isParent && (
          <button
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            onClick={() => {
              setActionError(null);
              setShowScheduleModal(true);
            }}
          >
            <Plus size={16} /> Start / Schedule New Run
          </button>
        )}
      </div>

      {actionSuccess && (
        <div style={{ padding: '0.85rem 1rem', marginBottom: '1.25rem', backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600 }}>
          {actionSuccess}
        </div>
      )}

      {actionError && (
        <div style={{ padding: '0.85rem 1rem', marginBottom: '1.25rem', backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger)', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600 }}>
          {actionError}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          Loading daily transit runs...
        </div>
      ) : trips.length === 0 ? (
        <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
          <Bus size={40} style={{ color: 'var(--color-border)', margin: '0 auto 1rem', display: 'block' }} />
          <h4 style={{ color: 'var(--color-primary)', marginBottom: '0.35rem' }}>No active transit runs today</h4>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', maxWidth: '420px', margin: '0 auto 1.25rem' }}>
            {isParent
              ? 'No trips are scheduled for your enrolled routes at this moment.'
              : 'Start a transit run for your active route to check in enrolled passengers and broadcast live updates.'}
          </p>
          {!isParent && routes.length > 0 && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowScheduleModal(true)}>
              <Plus size={15} /> Schedule Run Now
            </button>
          )}
        </div>
      ) : (
        <div>
          {/* Trip Selector Strip */}
          <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
            {trips.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTripId(t.id)}
                style={{
                  padding: '0.85rem 1.25rem',
                  borderRadius: '10px',
                  border: selectedTripId === t.id ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                  backgroundColor: selectedTripId === t.id ? '#F0F9FF' : '#FFFFFF',
                  cursor: 'pointer',
                  minWidth: '240px',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-primary)' }}>
                    {t.tripType === 'MORNING' ? 'Morning Run' : 'Afternoon Return'}
                  </span>
                  <span
                    className={`badge-status ${
                      t.status === 'IN_PROGRESS'
                        ? 'active'
                        : t.status === 'COMPLETED'
                        ? 'completed'
                        : 'pending'
                    }`}
                    style={{ fontSize: '0.7rem' }}
                  >
                    {t.status === 'IN_PROGRESS' && (
                      <Radio size={10} style={{ animation: 'pulse 1.5s infinite', marginRight: '3px' }} />
                    )}
                    {t.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)' }}>
                  {t.route?.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                  {t.vehicle?.make} ({t.vehicle?.plateNumber})
                </div>
              </div>
            ))}
          </div>

          {selectedTrip && (
            <div style={{ padding: '1.5rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid var(--color-border)', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <h4 style={{ color: 'var(--color-primary)', margin: 0, fontSize: '1.15rem' }}>
                    {selectedTrip.route?.name}
                  </h4>
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                    Destination: <strong>{selectedTrip.route?.destinationSchool}</strong> • Vehicle:{' '}
                    <strong>
                      {selectedTrip.vehicle?.make} {selectedTrip.vehicle?.model} ({selectedTrip.vehicle?.plateNumber})
                    </strong>
                  </div>
                </div>

                {!isParent && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {selectedTrip.status === 'SCHEDULED' && (
                      <button
                        onClick={() => handleStatusChange(selectedTrip.id, 'IN_PROGRESS')}
                        className="btn btn-primary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'var(--color-success)' }}
                      >
                        <Play size={14} /> Start Transit Run
                      </button>
                    )}

                    {selectedTrip.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => handleStatusChange(selectedTrip.id, 'COMPLETED')}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        <CheckCircle2 size={14} /> Complete Run
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Passenger Boarding Manifest */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '10px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-primary)' }}>
                    Student Passenger Manifest ({passengers.length} Assigned)
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      Boarded:{' '}
                      <strong style={{ color: 'var(--color-success)' }}>
                        {passengers.filter((p) => p.status === 'BOARDED' || p.status === 'ARRIVED_AT_SCHOOL' || p.status === 'BOARDED_FOR_RETURN' || p.status === 'DROPPED_OFF').length}
                      </strong>{' '}
                      / {passengers.length}
                    </div>

                    {!isParent && selectedTrip && selectedTrip.status !== 'COMPLETED' && selectedTrip.status !== 'CANCELLED' && (
                      <button
                        type="button"
                        id="scan-student-qr-btn"
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          setQrTokenInput('');
                          setScanError(null);
                          setScanResult(null);
                          setShowQrScanModal(true);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          backgroundColor: '#0F766E',
                          borderColor: '#0F766E',
                          fontWeight: 600,
                          fontSize: '0.78rem',
                          padding: '0.35rem 0.75rem',
                        }}
                      >
                        <QrCode size={14} /> Scan Student QR
                      </button>
                    )}
                  </div>
                </div>

                {passengersLoading ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                    Loading manifest...
                  </div>
                ) : passengers.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                    No students currently assigned to this transit route. Enrolled agreements will populate here automatically.
                  </div>
                ) : (
                  <table className="data-table" style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Grade</th>
                        <th>Designated Stop</th>
                        <th>Parent Contact</th>
                        <th>Boarding Status</th>
                        {!isParent && <th>Safety Action</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {passengers.map((p) => (
                        <tr key={p.id}>
                          <td>
                            <strong>
                              {p.student?.firstName} {p.student?.lastName}
                            </strong>
                          </td>
                          <td>{p.student?.grade || 'N/A'}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}>
                              <MapPin size={13} style={{ color: 'var(--color-accent)' }} />
                              {p.pickupStopName || p.student?.homeAddress || 'Main Terminal'}
                            </div>
                          </td>
                          <td>
                            {p.student?.parent?.firstName} {p.student?.parent?.lastName}
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                              {p.student?.parent?.phone || p.student?.emergencyPhone || 'N/A'}
                            </div>
                          </td>
                          <td>
                            <span
                              className={`badge-status ${
                                p.status === 'BOARDED'
                                  ? 'active'
                                  : p.status === 'DROPPED_OFF'
                                  ? 'completed'
                                  : 'pending'
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                          {!isParent && (
                            <td>
                              <div style={{ display: 'flex', gap: '0.4rem' }}>
                                {p.status !== 'BOARDED' && p.status !== 'DROPPED_OFF' && (
                                  <button
                                    onClick={() =>
                                      handleRecordBoarding(
                                        selectedTrip.id,
                                        p.studentId,
                                        `${p.student?.firstName} ${p.student?.lastName}`,
                                        'BOARDED'
                                      )
                                    }
                                    className="btn btn-primary btn-sm"
                                    style={{ padding: '0.25rem 0.65rem', fontSize: '0.775rem', backgroundColor: 'var(--color-success)' }}
                                  >
                                    <Check size={13} /> Check In (Board)
                                  </button>
                                )}

                                {p.status === 'BOARDED' && (
                                  <button
                                    onClick={() =>
                                      handleRecordBoarding(
                                        selectedTrip.id,
                                        p.studentId,
                                        `${p.student?.firstName} ${p.student?.lastName}`,
                                        'DROPPED_OFF'
                                      )
                                    }
                                    className="btn btn-secondary btn-sm"
                                    style={{ padding: '0.25rem 0.65rem', fontSize: '0.775rem' }}
                                  >
                                    <ShieldCheck size={13} /> Safe Drop-Off
                                  </button>
                                )}

                                {p.status === 'DROPPED_OFF' && (
                                  <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 600 }}>
                                    Completed
                                  </span>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Schedule Trip Modal */}
      {showScheduleModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '1.75rem',
              maxWidth: '500px',
              width: '100%',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <h3 style={{ margin: '0 0 1rem', color: 'var(--color-primary)' }}>Start / Schedule Daily Transit Run</h3>
            <form onSubmit={handleScheduleTrip}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Select Route *
                </label>
                <select
                  required
                  value={selectedRouteId}
                  onChange={(e) => setSelectedRouteId(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                >
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ➔ {r.destinationSchool}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Run Type *
                </label>
                <select
                  value={tripType}
                  onChange={(e) => setTripType(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                >
                  <option value="MORNING">Morning School Pickup Run</option>
                  <option value="AFTERNOON">Afternoon School Return Run</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Notes / Dispatch Instructions
                </label>
                <input
                  type="text"
                  placeholder="e.g. Traffic clear along Ring Road, departing 07:05 AM"
                  value={tripNotes}
                  onChange={(e) => setTripNotes(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowScheduleModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={submitting}
                >
                  {submitting ? 'Scheduling...' : 'Launch Run'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TASK 4: QR SafePass Scanner Modal */}
      {showQrScanModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#0F766E', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <QrCode size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--color-primary)', margin: 0 }}>
                    Scan Student SafePass
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                    Official QR Transit Verification • Trip #{selectedTrip?.id.slice(0, 8)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQrScanModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleScanPass} style={{ padding: '1.25rem' }}>
              {scanError && (
                <div style={{ padding: '0.75rem', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px', color: '#991B1B', fontSize: '0.825rem', marginBottom: '1rem' }}>
                  <strong>Scan Rejected:</strong> {scanError}
                </div>
              )}

              {scanResult && (
                <div style={{ padding: '0.85rem', backgroundColor: '#ECFDF5', border: '1px solid #6EE7B7', borderRadius: '8px', color: '#065F46', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>✓ Verified: {scanResult.student.firstName} {scanResult.student.lastName}</div>
                  <div style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>
                    School: {scanResult.student.schoolName} • Stop: {scanResult.student.pickupStopName}
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#047857', marginTop: '0.25rem' }}>
                    Status Updated: {scanResult.passengerStatus} (Authoritative Server Timestamp Recorded)
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Opaque QR Token / Scanned Payload
                </label>
                <input
                  type="text"
                  placeholder="Paste or scan ssp_live_... token"
                  value={qrTokenInput}
                  onChange={(e) => setQrTokenInput(e.target.value)}
                  autoFocus
                  style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)', fontFamily: 'monospace', fontSize: '0.85rem' }}
                />
                <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block', marginTop: '0.25rem' }}>
                  Reads cryptographically secure opaque token from printed or mobile card.
                </span>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Transit Event Type (State Machine)
                </label>
                <select
                  value={scanEventType}
                  onChange={(e) => setScanEventType(e.target.value as any)}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}
                >
                  <option value="BOARDED">BOARDED (Morning Home Pickup Check-in)</option>
                  <option value="ARRIVED_AT_SCHOOL">ARRIVED_AT_SCHOOL (School Drop-Off Safe Arrival)</option>
                  <option value="BOARDED_FOR_RETURN">BOARDED_FOR_RETURN (Afternoon School Departure)</option>
                  <option value="DROPPED_OFF">DROPPED_OFF (Afternoon Home Drop-Off Completed)</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Scanned Pickup Stop (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bole Medhanealem Stop"
                  value={scanStopInput}
                  onChange={(e) => setScanStopInput(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowQrScanModal(false)}
                  disabled={scanning}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={scanning || !qrTokenInput.trim()}
                  style={{ backgroundColor: '#0F766E', borderColor: '#0F766E', fontWeight: 600 }}
                >
                  {scanning ? 'Verifying SafePass...' : 'Authorize Boarding'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
