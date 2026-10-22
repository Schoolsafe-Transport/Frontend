import { useState, FC, FormEvent } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
  Loader2,
  Eye,
  EyeOff,
  Phone,
  ArrowLeft,
  Lock,
} from 'lucide-react';
import { initiateFaydaFinApi, verifyFaydaFinApi, getFaydaAuthUrlApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface FaydaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
}

export const FaydaVerificationModal: FC<FaydaModalProps> = ({ isOpen, onClose, onVerified }) => {
  const { refreshUser } = useAuth();
  const [method, setMethod] = useState<'FIN' | 'OIDC'>('FIN');
  const [step, setStep] = useState<1 | 2>(1);
  const [finNumber, setFinNumber] = useState('');
  const [showFin, setShowFin] = useState(false);
  const [otp, setOtp] = useState('');
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [maskedPhone, setMaskedPhone] = useState<string>('');
  const [consentAgreed, setConsentAgreed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [maskedVerifiedId, setMaskedVerifiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setStep(1);
    setOtp('');
    setTransactionId(null);
    setMaskedPhone('');
    setError(null);
    setSuccess(null);
    setMaskedVerifiedId(null);
  };

  const handleInitiateFin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const cleanFin = finNumber.replace(/[\s-]/g, '');
    if (!/^\d{12}$|^\d{16}$/.test(cleanFin)) {
      setError('Fayda National ID must be a 12-digit FIN number or 16-digit VID.');
      return;
    }

    try {
      setLoading(true);
      const res = await initiateFaydaFinApi(cleanFin);
      if (res.success) {
        setTransactionId(res.data.transactionId);
        setMaskedPhone(res.data.maskedPhone || '+251 9*** ***01');
        setStep(2);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not initiate Fayda verification. Please check your Fayda ID number.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const cleanFin = finNumber.replace(/[\s-]/g, '');
    const cleanOtp = otp.trim();

    if (!cleanOtp || cleanOtp.length < 4) {
      setError('Please enter the 6-digit verification code (OTP) sent to your registered phone.');
      return;
    }

    if (!consentAgreed) {
      setError('You must confirm your consent to establish verified guardian status.');
      return;
    }

    try {
      setLoading(true);
      const res = await verifyFaydaFinApi(cleanFin, cleanOtp, transactionId || undefined);
      if (res.success) {
        const maskedId = res.data?.faydaIdNumber || `********${cleanFin.slice(-4)}`;
        setMaskedVerifiedId(maskedId);
        setSuccess('Fayda National ID verified successfully! Your guardian account is now verified.');
        await refreshUser();
        setTimeout(() => {
          onVerified();
          onClose();
          handleReset();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed. Please check your SMS OTP code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOidcRedirect = async () => {
    try {
      setLoading(true);
      const res = await getFaydaAuthUrlApi();
      if (res.authUrl) {
        window.location.href = res.authUrl;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not initiate Fayda eSignet authentication.');
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          maxWidth: '520px',
          width: '100%',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header with Ethiopian Fayda Brand Accents */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%)',
            color: '#FFFFFF',
            padding: '1.5rem',
            position: 'relative',
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.25rem',
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: '#FFFFFF',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={26} style={{ color: '#60A5FA' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#FFFFFF' }}>
                Fayda Digital ID Verification
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#93C5FD', margin: 0 }}>
                Ethiopian National Digital Identity Platform (ፋይዳ)
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem' }}>
          {/* Explanation banner */}
          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: '#F0F9FF',
              border: '1px solid #BAE6FD',
              borderRadius: '10px',
              fontSize: '0.825rem',
              color: '#0369A1',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
            }}
          >
            <Lock size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Why identity verification is required:</strong> To safeguard school children, Ethiopian student transit regulations require verified guardianship identity before requesting transit routes or seat bookings.
            </div>
          </div>

          {error && (
            <div
              style={{
                padding: '0.85rem',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: '8px',
                color: '#B91C1C',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div
              style={{
                padding: '0.85rem',
                backgroundColor: '#F0FDF4',
                border: '1px solid #86EFAC',
                borderRadius: '8px',
                color: '#15803D',
                fontSize: '0.875rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
                <span>{success}</span>
              </div>
              {maskedVerifiedId && (
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#166534', marginLeft: '1.6rem' }}>
                  Fayda Identifier: {maskedVerifiedId}
                </div>
              )}
            </div>
          )}

          {/* Toggle Verification Methods */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#F1F5F9',
              padding: '4px',
              borderRadius: '8px',
              marginBottom: '1.25rem',
            }}
          >
            <button
              type="button"
              style={{
                flex: 1,
                padding: '0.6rem',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                backgroundColor: method === 'FIN' ? '#FFFFFF' : 'transparent',
                color: method === 'FIN' ? '#1E3A8A' : '#64748B',
                boxShadow: method === 'FIN' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
              onClick={() => {
                setMethod('FIN');
                handleReset();
              }}
            >
              Fayda FIN Number & SMS OTP
            </button>
            <button
              type="button"
              style={{
                flex: 1,
                padding: '0.6rem',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                backgroundColor: method === 'OIDC' ? '#FFFFFF' : 'transparent',
                color: method === 'OIDC' ? '#1E3A8A' : '#64748B',
                boxShadow: method === 'OIDC' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
              onClick={() => {
                setMethod('OIDC');
                handleReset();
              }}
            >
              Fayda eSignet (OIDC)
            </button>
          </div>

          {method === 'FIN' ? (
            <div>
              {step === 1 ? (
                /* Step 1: FIN Number Entry */
                <form onSubmit={handleInitiateFin}>
                  <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1rem' }}>
                    Enter your 12-digit Ethiopian Fayda Identification Number (FIN) printed on your National Digital ID card.
                  </p>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: '#334155' }}>
                      Fayda FIN Number *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="input-fayda-fin"
                        type={showFin ? 'text' : 'password'}
                        placeholder="e.g. 1234 5678 9012"
                        value={finNumber}
                        onChange={(e) => setFinNumber(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem 2.75rem 0.75rem 0.75rem',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          letterSpacing: '2px',
                          fontFamily: showFin ? 'monospace' : 'inherit',
                        }}
                        required
                        autoComplete="off"
                      />
                      <button
                        type="button"
                        onClick={() => setShowFin(!showFin)}
                        style={{
                          position: 'absolute',
                          right: '0.75rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: '#64748B',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title={showFin ? 'Hide Fayda Number' : 'Show Fayda Number'}
                      >
                        {showFin ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.35rem' }}>
                      Your complete Fayda number is masked for privacy and never exposed publicly.
                    </div>
                  </div>

                  <button
                    id="btn-fayda-continue"
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      padding: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                    }}
                  >
                    {loading ? <Loader2 size={18} className="spin" /> : <ShieldCheck size={18} />}
                    Continue
                  </button>
                </form>
              ) : (
                /* Step 2: SMS OTP Verification */
                <form onSubmit={handleVerifyOtp}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E3A8A' }}>
                      Step 2: Enter Fayda SMS OTP
                    </span>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-accent)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <ArrowLeft size={14} /> Change Number
                    </button>
                  </div>

                  {/* Masked phone dispatch notification */}
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      backgroundColor: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      color: '#1E40AF',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <Phone size={16} style={{ flexShrink: 0 }} />
                    <span>
                      A 6-digit verification code has been dispatched by Fayda to your registered phone <strong>{maskedPhone}</strong>.
                    </span>
                  </div>


                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: '#334155' }}>
                      Enter 6-Digit Fayda OTP *
                    </label>
                    <input
                      id="input-fayda-otp"
                      type="text"
                      maxLength={8}
                      placeholder="e.g. 123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        fontSize: '1.1rem',
                        letterSpacing: '4px',
                        textAlign: 'center',
                        fontWeight: 700,
                      }}
                      required
                      autoFocus
                    />
                  </div>

                  {/* Consent Checkbox */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <input
                      type="checkbox"
                      id="fayda-consent"
                      checked={consentAgreed}
                      onChange={(e) => setConsentAgreed(e.target.checked)}
                      style={{ marginTop: '3px', accentColor: 'var(--color-accent)' }}
                    />
                    <label htmlFor="fayda-consent" style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.4, cursor: 'pointer' }}>
                      I authorize SchoolSafe to verify my national identity credentials through the authorized Fayda National Digital ID Authority e-KYC integration.
                    </label>
                  </div>

                  <button
                    id="btn-confirm-fayda-verification"
                    type="submit"
                    disabled={loading || !consentAgreed}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      padding: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                    }}
                  >
                    {loading ? <Loader2 size={18} className="spin" /> : <ShieldCheck size={18} />}
                    Confirm & Complete Verification
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.25rem' }}>
                Authenticate directly through Ethiopia's official <strong>Fayda eSignet</strong> OpenID Connect portal using biometric or SMS credentials.
              </p>

              <button
                type="button"
                onClick={handleOidcRedirect}
                disabled={loading}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  backgroundColor: '#0F766E',
                }}
              >
                {loading ? <Loader2 size={18} className="spin" /> : <ExternalLink size={18} />}
                Continue to Fayda eSignet Portal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
