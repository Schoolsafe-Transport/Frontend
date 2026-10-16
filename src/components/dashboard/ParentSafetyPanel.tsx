import { useState, useEffect, FC } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Plus,
  Trash2,
  Phone,
  UserCheck,
  X,
} from 'lucide-react';
import {
  getStudentsApi,
  getAuthorizedPickupsApi,
  createAuthorizedPickupApi,
  deleteAuthorizedPickupApi,
  createSafetyIncidentApi,
  getSafetyIncidentsApi,
} from '../../services/api';

export const ParentSafetyPanel: FC<{ user: any }> = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [pickups, setPickups] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [showAddPickupModal, setShowAddPickupModal] = useState<boolean>(false);
  const [showIncidentModal, setShowIncidentModal] = useState<boolean>(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // New Pickup Contact Form
  const [pickupName, setPickupName] = useState('');
  const [pickupRelationship, setPickupRelationship] = useState('Guardian');
  const [pickupPhone, setPickupPhone] = useState('+251 9');
  const [isEmergencyContact, setIsEmergencyContact] = useState(false);
  const [submittingPickup, setSubmittingPickup] = useState(false);

  // Incident Form
  const [incidentTitle, setIncidentTitle] = useState('');
  const [incidentDescription, setIncidentDescription] = useState('');
  const [incidentSeverity, setIncidentSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [incidentLocation, setIncidentLocation] = useState('');
  const [submittingIncident, setSubmittingIncident] = useState(false);

  const loadData = async () => {
    try {
      const [studentsData, incidentsData] = await Promise.all([
        getStudentsApi(),
        getSafetyIncidentsApi(),
      ]);
      setStudents(studentsData || []);
      setIncidents(incidentsData || []);
      if (studentsData && studentsData.length > 0 && !selectedStudentId) {
        setSelectedStudentId(studentsData[0].id);
      }
    } catch (_err) {
      // Catch
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadPickups = async (studentId: string) => {
    if (!studentId) return;
    try {
      const data = await getAuthorizedPickupsApi(studentId);
      setPickups(data || []);
    } catch (_err) {
      // Catch
    }
  };

  useEffect(() => {
    if (selectedStudentId) {
      loadPickups(selectedStudentId);
    }
  }, [selectedStudentId]);

  const handleAddPickup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;
    try {
      setSubmittingPickup(true);
      setError(null);
      await createAuthorizedPickupApi({
        studentId: selectedStudentId,
        fullName: pickupName.trim(),
        relationship: pickupRelationship.trim(),
        phone: pickupPhone.trim(),
        isEmergencyContact,
      });

      setSuccess('Authorized pickup contact registered successfully!');
      setShowAddPickupModal(false);
      setPickupName('');
      setPickupPhone('+251 9');
      loadPickups(selectedStudentId);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add pickup contact');
    } finally {
      setSubmittingPickup(false);
    }
  };

  const handleDeletePickup = async (pickupId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from authorized pickups?`)) return;
    try {
      setError(null);
      await deleteAuthorizedPickupApi(selectedStudentId, pickupId);
      setSuccess(`${name} removed from authorized pickup list.`);
      loadPickups(selectedStudentId);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove pickup contact');
    }
  };

  const handleReportIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingIncident(true);
      setError(null);
      await createSafetyIncidentApi({
        title: incidentTitle.trim(),
        description: incidentDescription.trim(),
        severity: incidentSeverity,
        location: incidentLocation.trim() || undefined,
      });

      setSuccess('Safety concern logged. Support dispatch and school transportation officers have been alerted.');
      setShowIncidentModal(false);
      setIncidentTitle('');
      setIncidentDescription('');
      setIncidentLocation('');
      loadData();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit incident');
    } finally {
      setSubmittingIncident(false);
    }
  };

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  return (
    <div className="panel-card">
      <div className="panel-header">
        <div>
          <h3 className="panel-title">Child Safety & Emergency Protocol</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
            Authorized pickup delegates, provider background status, and 24/7 rapid incident reporting
          </p>
        </div>
        <button
          className="btn btn-primary btn-sm"
          style={{ backgroundColor: 'var(--color-danger)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          onClick={() => {
            setError(null);
            setShowIncidentModal(true);
          }}
        >
          <AlertTriangle size={15} /> Report Safety Concern
        </button>
      </div>

      {success && (
        <div style={{ padding: '0.85rem 1rem', marginBottom: '1.25rem', backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600 }}>
          {success}
        </div>
      )}

      {error && (
        <div style={{ padding: '0.85rem 1rem', marginBottom: '1.25rem', backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger)', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600 }}>
          {error}
        </div>
      )}

      {/* Grid: Authorized Pickups vs Safety Verification */}
      <div className="grid-2" style={{ alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        {/* Authorized Pickups Card */}
        <div style={{ padding: '1.25rem', border: '1px solid var(--color-border)', borderRadius: '10px', backgroundColor: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h4 style={{ margin: 0, color: 'var(--color-primary)' }}>Authorized Pickup Delegates</h4>
            <button
              onClick={() => {
                setError(null);
                setShowAddPickupModal(true);
              }}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.8rem', padding: '0.25rem 0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <Plus size={14} /> Add Contact
            </button>
          </div>

          <p style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
            Only adults registered below are authorized to receive your child at designated drop-off points. Drivers strictly verify identity against this roster.
          </p>

          {students.length > 1 && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
                Select Child:
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName} ({s.schoolName})
                  </option>
                ))}
              </select>
            </div>
          )}

          {pickups.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px dashed var(--color-border)' }}>
              <UserCheck size={28} style={{ color: 'var(--color-text-muted)', margin: '0 auto 0.5rem', display: 'block' }} />
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                No secondary pickup contacts recorded for {selectedStudent?.firstName || 'your child'}.
              </div>
              <button
                onClick={() => setShowAddPickupModal(true)}
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--color-accent)', marginTop: '0.5rem' }}
              >
                + Register First Contact
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {pickups.map((p) => (
                <div
                  key={p.id}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      {p.fullName}{' '}
                      <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--color-text-secondary)' }}>
                        ({p.relationship})
                      </span>
                      {p.isEmergencyContact && (
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', color: 'var(--color-danger)', fontWeight: 600 }}>
                          Emergency
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.15rem' }}>
                      <Phone size={12} /> {p.phone}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeletePickup(p.id, p.fullName)}
                    style={{ border: 'none', background: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: '0.25rem' }}
                    title="Remove Contact"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Verification Status Card */}
        <div style={{ padding: '1.25rem', border: '1px solid var(--color-border)', borderRadius: '10px', backgroundColor: '#FFFFFF' }}>
          <h4 style={{ marginBottom: '0.75rem', color: 'var(--color-primary)' }}>
            Safety Assurance & Standards
          </h4>
          <p style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
            Every school transport operator on SchoolSafe undergoes rigorous tripartite verification.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--color-success)' }}>
              <ShieldCheck size={20} />
              <div>
                <strong>Commercial Driver Background Investigation</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  Criminal background screening and federal license validation
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--color-success)' }}>
              <ShieldCheck size={20} />
              <div>
                <strong>Vehicle Annual Safety Inspection</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  Brake system, emergency exits, and seatbelt roadworthiness certification
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--color-success)' }}>
              <ShieldCheck size={20} />
              <div>
                <strong>Student Transit Liability Insurance</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  Active passenger transit coverage required for all routes
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Incidents History */}
      {incidents.length > 0 && (
        <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
          <h4 style={{ color: 'var(--color-primary)', marginBottom: '0.75rem' }}>
            Reported Safety Concerns ({incidents.length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {incidents.map((inc) => (
              <div
                key={inc.id}
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: '#FFF8F8',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.925rem', color: 'var(--color-primary)' }}>
                    {inc.title}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                    {inc.description}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>
                    Reported on {new Date(inc.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span
                    className={`badge-status ${
                      inc.severity === 'CRITICAL' || inc.severity === 'HIGH' ? 'cancelled' : 'pending'
                    }`}
                  >
                    {inc.severity} Severity
                  </span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.35rem' }}>
                    Status: <strong>{inc.status}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Pickup Modal */}
      {showAddPickupModal && (
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
              maxWidth: '460px',
              width: '100%',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, color: 'var(--color-primary)' }}>Register Authorized Pickup Delegate</h3>
              <button
                onClick={() => setShowAddPickupModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddPickup}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahel Bekele"
                  value={pickupName}
                  onChange={(e) => setPickupName(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Relationship to Child *
                </label>
                <select
                  value={pickupRelationship}
                  onChange={(e) => setPickupRelationship(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                >
                  <option value="Parent">Parent</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Grandparent">Grandparent</option>
                  <option value="Aunt / Uncle">Aunt / Uncle</option>
                  <option value="Sibling (Adult)">Adult Sibling</option>
                  <option value="Designated Escort">Designated Family Escort</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Mobile Phone Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+251 91 123 4567"
                  value={pickupPhone}
                  onChange={(e) => setPickupPhone(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="emergencyCheck"
                  checked={isEmergencyContact}
                  onChange={(e) => setIsEmergencyContact(e.target.checked)}
                />
                <label htmlFor="emergencyCheck" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
                  Designate as primary emergency contact
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowAddPickupModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={submittingPickup}
                >
                  {submittingPickup ? 'Saving...' : 'Authorize Person'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Incident Modal */}
      {showIncidentModal && (
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertTriangle size={18} /> Report Safety Concern
              </h3>
              <button
                onClick={() => setShowIncidentModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleReportIncident}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Concern Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Driver speeding, delay without notice, seatbelt failure"
                  value={incidentTitle}
                  onChange={(e) => setIncidentTitle(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Severity Level *
                </label>
                <select
                  value={incidentSeverity}
                  onChange={(e) => setIncidentSeverity(e.target.value as any)}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                >
                  <option value="LOW">Low (Minor delay, cosmetic)</option>
                  <option value="MEDIUM">Medium (Route deviation, driver behavior)</option>
                  <option value="HIGH">High (Reckless driving, vehicle breakdown)</option>
                  <option value="CRITICAL">Critical (Accident, child safety risk)</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Location / Route (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Near Bole Medhanealem Church"
                  value={incidentLocation}
                  onChange={(e) => setIncidentLocation(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Detailed Description *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Please describe what occurred in detail..."
                  value={incidentDescription}
                  onChange={(e) => setIncidentDescription(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowIncidentModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  style={{ backgroundColor: 'var(--color-danger)' }}
                  disabled={submittingIncident}
                >
                  {submittingIncident ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
