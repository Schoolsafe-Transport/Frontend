import { FC, useState, useEffect } from 'react';
import {
  Printer,
  X,
  Shield,
  Bus,
  MapPin,
  Phone,
  AlertCircle,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';
import {
  getStudentTransportPassApi,
  regenerateStudentTransportPassApi,
  StudentTransportPassData,
} from '../../services/api';

interface PrintableTransportPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  agreementId: string | null;
  studentName?: string;
}

export const PrintableTransportPassModal: FC<PrintableTransportPassModalProps> = ({
  isOpen,
  onClose,
  agreementId,
  studentName,
}) => {
  const [pass, setPass] = useState<StudentTransportPassData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rotating, setRotating] = useState(false);
  const [rotateNotice, setRotateNotice] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && agreementId) {
      loadPass(agreementId);
    } else {
      setPass(null);
      setError(null);
      setRotateNotice(null);
    }
  }, [isOpen, agreementId]);

  const loadPass = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStudentTransportPassApi(id);
      setPass(data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to load student transport pass. Please ensure the booking is active and verified.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRotatePass = async () => {
    if (!agreementId) return;
    if (!window.confirm('Are you sure you want to regenerate this pass? The previous printed QR code will be invalidated.')) {
      return;
    }
    setRotating(true);
    setRotateNotice(null);
    try {
      const data = await regenerateStudentTransportPassApi(agreementId);
      setPass(data);
      setRotateNotice('Pass regenerated successfully with a new secure token!');
      setTimeout(() => setRotateNotice(null), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to regenerate pass');
    } finally {
      setRotating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        overflowY: 'auto',
      }}
      className="printable-pass-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Print Specific Styling */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .printable-card-wrapper,
          .printable-card-wrapper * {
            visibility: visible !important;
          }
          .printable-card-wrapper {
            position: absolute !important;
            left: 50% !important;
            top: 20px !important;
            transform: translateX(-50%) !important;
            width: 100% !important;
            max-width: 480px !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            border: 2px solid #0f172a !important;
            page-break-inside: avoid !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
        }}
      >
        {/* Modal Header (Screen Only) */}
        <div
          className="no-print"
          style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#F8FAFC',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                backgroundColor: '#0F766E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}
            >
              <Shield size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0F172A', fontWeight: 700 }}>
                Student Transport Pass
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B' }}>
                {studentName ? `Official SafePass for ${studentName}` : 'Official SafePass for Daily Bus Boarding'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {pass && (
              <button
                type="button"
                onClick={handlePrint}
                className="btn btn-primary btn-sm"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: '#0F766E',
                  borderColor: '#0F766E',
                  padding: '0.45rem 0.9rem',
                  fontWeight: 600,
                }}
              >
                <Printer size={15} /> Print Pass
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#64748B',
                padding: '0.35rem',
                borderRadius: '6px',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1 }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748B' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  border: '3px solid #CBD5E1',
                  borderTopColor: '#0F766E',
                  borderRadius: '50%',
                  margin: '0 auto 1rem auto',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <p style={{ margin: 0, fontSize: '0.9rem' }}>Loading secure transport pass...</p>
            </div>
          )}

          {error && !loading && (
            <div
              style={{
                padding: '1.25rem',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: '12px',
                color: '#991B1B',
                margin: '1rem 0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <AlertCircle size={18} />
                <strong style={{ fontSize: '0.95rem' }}>Unable to Generate Pass</strong>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.5 }}>{error}</p>
              <p style={{ marginTop: '0.75rem', marginBottom: 0, fontSize: '0.8rem', color: '#B91C1C' }}>
                A student transport pass can only be generated after an accepted, active transportation booking is established with an eligible, verified provider.
              </p>
            </div>
          )}

          {rotateNotice && (
            <div
              className="no-print"
              style={{
                padding: '0.65rem 0.85rem',
                backgroundColor: '#ECFDF5',
                border: '1px solid #6EE7B7',
                borderRadius: '8px',
                color: '#065F46',
                marginBottom: '1rem',
                fontSize: '0.825rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <CheckCircle size={15} /> {rotateNotice}
            </div>
          )}

          {pass && !loading && (
            <div>
              {/* THE PRINTABLE PASS CARD (Fits Standard Physical Card / A5 / A4 Paper) */}
              <div
                className="printable-card-wrapper"
                id="printable-student-pass"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '2px solid #0F172A',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              >
                {/* Header Branding Strip */}
                <div
                  style={{
                    backgroundColor: '#0F766E',
                    color: '#FFFFFF',
                    padding: '0.85rem 1.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Shield size={22} color="#FFFFFF" />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '0.02em' }}>
                        SchoolSafe™
                      </div>
                      <div style={{ fontSize: '0.65rem', opacity: 0.9, letterSpacing: '0.04em' }}>
                        STUDENT TRANSPORT SAFEPASS
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        backgroundColor: '#10B981',
                        color: '#064E3B',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '9999px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      ● {pass.status}
                    </span>
                    <div style={{ fontSize: '0.65rem', marginTop: '0.25rem', opacity: 0.85 }}>
                      Code: {pass.passCode}
                    </div>
                  </div>
                </div>

                {/* Main Card Content */}
                <div style={{ padding: '1.25rem' }}>
                  {/* Student Identity Row */}
                  <div
                    style={{
                      borderBottom: '1.5px dashed #CBD5E1',
                      paddingBottom: '0.85rem',
                      marginBottom: '1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 600 }}>
                        Student Full Name
                      </div>
                      <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', marginTop: '0.1rem' }}>
                        {pass.student.firstName} {pass.student.lastName}
                      </div>
                      {pass.student.grade && (
                        <div style={{ fontSize: '0.8rem', color: '#0F766E', fontWeight: 600 }}>
                          {pass.student.grade}
                        </div>
                      )}
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 600 }}>
                        School & Branch
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B', marginTop: '0.1rem' }}>
                        {pass.school.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        {pass.school.branch}
                      </div>
                    </div>
                  </div>

                  {/* QR Code Section (Large & High Contrast) */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '0.75rem',
                      backgroundColor: '#F8FAFC',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      marginBottom: '1rem',
                    }}
                  >
                    <div
                      style={{
                        padding: '0.5rem',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        display: 'inline-block',
                      }}
                    >
                      <img
                        src={pass.qrDataUrl}
                        alt="Student Transport QR Code"
                        style={{
                          width: '210px',
                          height: '210px',
                          display: 'block',
                          imageRendering: 'crisp-edges',
                        }}
                      />
                    </div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>
                      Scan at Vehicle Door for Boarding & Arrival Verification
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#94A3B8', marginTop: '0.15rem' }}>
                      Pass ID: {pass.passCode} • Scans: {pass.scanCount}
                    </div>
                  </div>

                  {/* Transport Details Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '0.75rem',
                      fontSize: '0.8rem',
                      marginBottom: '0.85rem',
                    }}
                  >
                    {/* Vehicle Box */}
                    <div
                      style={{
                        padding: '0.65rem 0.75rem',
                        backgroundColor: '#F1F5F9',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                      }}
                    >
                      <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Bus size={12} /> Assigned Vehicle
                      </div>
                      <div
                        style={{
                          fontSize: '1rem',
                          fontWeight: 800,
                          color: '#0F172A',
                          marginTop: '0.25rem',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {pass.vehicle.plateNumber}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                        {pass.vehicle.make} {pass.vehicle.model}
                      </div>
                    </div>

                    {/* Provider Box */}
                    <div
                      style={{
                        padding: '0.65rem 0.75rem',
                        backgroundColor: '#F1F5F9',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                      }}
                    >
                      <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Shield size={12} /> Transport Provider
                      </div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', marginTop: '0.25rem' }}>
                        {pass.provider.name}
                      </div>
                      {pass.provider.phone && (
                        <div style={{ fontSize: '0.72rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.15rem' }}>
                          <Phone size={10} /> {pass.provider.phone}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Route & Stop Box */}
                  <div
                    style={{
                      padding: '0.65rem 0.75rem',
                      backgroundColor: '#F1F5F9',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      fontSize: '0.78rem',
                      marginBottom: '0.85rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                      <span style={{ fontWeight: 700, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin size={12} /> {pass.route.name}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
                        Morning: {pass.route.pickupTimeMorning || '07:15 AM'} • Return: {pass.route.dropoffTimeAfternoon || '03:45 PM'}
                      </span>
                    </div>
                    <div style={{ color: '#475569' }}>
                      <strong>Designated Stop:</strong> {pass.route.pickupStopName}
                    </div>
                  </div>

                  {/* Emergency Contact & Notice Footer */}
                  <div
                    style={{
                      borderTop: '1px solid #E2E8F0',
                      paddingTop: '0.65rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.7rem',
                      color: '#64748B',
                    }}
                  >
                    <div>
                      {pass.student.emergencyPhone && (
                        <span>
                          <strong>Emergency Contact:</strong> {pass.student.emergencyPhone}
                        </span>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span>Issued: {new Date(pass.issuedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Security Anti-Tamper Bar */}
                <div
                  style={{
                    backgroundColor: '#0F172A',
                    color: '#94A3B8',
                    padding: '0.4rem 1rem',
                    fontSize: '0.6rem',
                    textAlign: 'center',
                    letterSpacing: '0.03em',
                  }}
                >
                  OFFICIAL SCHOOLSAFE SECURE TOKEN • NOT TRANSFERABLE • BOARDING RESTRICTED TO ASSIGNED VEHICLE
                </div>
              </div>

              {/* Action Buttons & Safety Tips (Screen Only) */}
              <div
                className="no-print"
                style={{
                  marginTop: '1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                  💡 <em>Print this card on standard paper or cardstock for your child to keep in their school bag or badge holder.</em>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={handleRotatePass}
                    disabled={rotating}
                    className="btn btn-secondary btn-sm"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.78rem',
                    }}
                    title="Regenerate pass if old code was compromised or lost"
                  >
                    <RefreshCw size={13} className={rotating ? 'spin' : ''} />
                    {rotating ? 'Regenerating...' : 'Rotate Token'}
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="btn btn-primary btn-sm"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      backgroundColor: '#0F766E',
                      borderColor: '#0F766E',
                      fontWeight: 600,
                    }}
                  >
                    <Printer size={15} /> Print / Save PDF
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
