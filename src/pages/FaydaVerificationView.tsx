import { useState, FC, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  Phone,
  ArrowLeft,
} from 'lucide-react';
import { initiateFaydaFinApi, verifyFaydaFinApi, getFaydaAuthUrlApi } from '../services/api';

interface FaydaVerificationViewProps {
  onSuccess: () => void;
  onSkipToDashboard: () => void;
}

export const FaydaVerificationView: FC<FaydaVerificationViewProps> = ({
  onSuccess,
  onSkipToDashboard,
}) => {
  const { refreshUser } = useAuth();
  const [method, setMethod] = useState<'FIN' | 'OIDC'>('FIN');
  const [step, setStep] = useState<1 | 2>(1);
  const [finNumber, setFinNumber] = useState('');
  const [showFin, setShowFin] = useState(false);
  const [otp, setOtp] = useState('');
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [maskedPhone, setMaskedPhone] = useState<string>('');
  const [simulatedOtp, setSimulatedOtp] = useState<string | null>(null);
  const [consentAgreed, setConsentAgreed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [maskedVerifiedId, setMaskedVerifiedId] = useState<string | null>(null);

  const handleReset = () => {
    setStep(1);
    setOtp('');
    setTransactionId(null);
    setMaskedPhone('');
    setSimulatedOtp(null);
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
        if (res.data.simulatedOtp) {
          setSimulatedOtp(res.data.simulatedOtp);
        }
        setStep(2);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Could not initiate Fayda verification. Please check your Fayda FIN number and try again.'
      );
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
          onSuccess();
          handleReset();
        }, 1500);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Verification failed. Please check your SMS OTP code and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOidcRedirect = async () => {
    setError(null);
    try {
      setLoading(true);
      const res = await getFaydaAuthUrlApi();
      if (res.authUrl) {
        window.location.href = res.authUrl;
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Could not initiate Fayda eSignet authentication. Please try direct FIN verification.'
      );
      setLoading(false);
    }
  };

  return (
    <div className="auth-box" style={{ maxWidth: '640px' }}>
      <div className="auth-header">
        <div className="auth-brand-logo-wrap">
          <img src="/logo-shield.png" alt="SchoolSafe Logo" className="auth-logo-img" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <ShieldCheck size={22} style={{ color: 'var(--color-accent)' }} />
          <h2>Fayda National ID Verification</h2>
        </div>
        <p>
          Ethiopian National Digital Identity Authority (ፋይዳ) • Safe School Transit Authentication
        </p>
      </div>

      {/* Verification Notice Banner */}
      <div
        style={{
          padding: '1rem 1.25rem',
          backgroundColor: '#F0F9FF',
          border: '1px solid #BAE6FD',
          borderRadius: '10px',
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
          color: '#0369A1',
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Lock size={16} /> Why verify your identity?
        </div>
        <p style={{ margin: 0, lineHeight: 1.5, color: '#0C4A6E' }}>
          Under Ethiopian student transit safety standards, parent guardianship identity must be confirmed
          before requesting school bus seats. You can browse all routes right now, but verified identity is required to complete seat bookings.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success" style={{ marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{success}</span>
          </div>
          {maskedVerifiedId && (
            <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#166534', marginLeft: '1.6rem' }}>
              Fayda Identifier: {maskedVerifiedId}
            </div>
          )}
        </div>
      )}

      {/* Method Switcher */}
      <div
        style={{
          display: 'flex',
          backgroundColor: '#F1F5F9',
          padding: '4px',
          borderRadius: '8px',
          marginBottom: '1.5rem',
        }}
      >
        <button
          type="button"
          style={{
            flex: 1,
            padding: '0.65rem',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            backgroundColor: method === 'FIN' ? '#FFFFFF' : 'transparent',
            color: method === 'FIN' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
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
            padding: '0.65rem',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            backgroundColor: method === 'OIDC' ? '#FFFFFF' : 'transparent',
            color: method === 'OIDC' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            boxShadow: method === 'OIDC' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          }}
          onClick={() => {
            setMethod('OIDC');
            handleReset();
          }}
        >
          Fayda eSignet Portal (OIDC)
        </button>
      </div>

      {method === 'FIN' ? (
        <div>
          {step === 1 ? (
            /* Step 1: Input FIN */
            <form onSubmit={handleInitiateFin}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label htmlFor="verify-fin-number" style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Fayda FIN Number *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="verify-fin-number"
                    className="form-input"
                    type={showFin ? 'text' : 'password'}
                    placeholder="e.g. 1234 5678 9012"
                    value={finNumber}
                    onChange={(e) => setFinNumber(e.target.value)}
                    style={{
                      letterSpacing: '2px',
                      fontSize: '1rem',
                      fontFamily: showFin ? 'monospace' : 'inherit',
                      paddingRight: '2.75rem',
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
                      color: 'var(--color-text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title={showFin ? 'Hide Fayda Number' : 'Show Fayda Number'}
                  >
                    {showFin ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '0.35rem' }}>
                  Your complete Fayda number is masked for privacy and never exposed publicly.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onSkipToDashboard}
                  style={{ flex: 1 }}
                >
                  Skip for Now
                </button>
                <button
                  id="btn-verify-fin-continue"
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{
                    flex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontWeight: 700,
                  }}
                >
                  {loading ? <Loader2 size={18} className="spin" /> : <ShieldCheck size={18} />}
                  Continue
                </button>
              </div>
            </form>
          ) : (
            /* Step 2: SMS OTP Entry */
            <form onSubmit={handleVerifyOtp}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)' }}>
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

              {simulatedOtp && (
                <div
                  style={{
                    padding: '0.5rem 0.75rem',
                    backgroundColor: '#FEF3C7',
                    border: '1px solid #FCD34D',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    color: '#92400E',
                    marginBottom: '1rem',
                  }}
                >
                  <strong>Fayda Sandbox:</strong> Use test OTP: <code>{simulatedOtp}</code>
                </div>
              )}

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label htmlFor="verify-otp-input" style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Enter 6-Digit Fayda OTP *
                </label>
                <input
                  id="verify-otp-input"
                  className="form-input"
                  type="text"
                  maxLength={8}
                  placeholder="e.g. 123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  style={{
                    letterSpacing: '4px',
                    fontSize: '1.1rem',
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
                  id="fayda-page-consent"
                  checked={consentAgreed}
                  onChange={(e) => setConsentAgreed(e.target.checked)}
                  style={{ marginTop: '3px', accentColor: 'var(--color-accent)' }}
                />
                <label htmlFor="fayda-page-consent" style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: 1.4, cursor: 'pointer' }}>
                  I authorize SchoolSafe to verify my guardianship identity through the authorized Fayda National Digital ID Authority e-KYC integration.
                </label>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onSkipToDashboard}
                  style={{ flex: 1 }}
                >
                  Skip for Now
                </button>
                <button
                  id="btn-confirm-page-verification"
                  type="submit"
                  disabled={loading || !consentAgreed}
                  className="btn btn-primary"
                  style={{
                    flex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontWeight: 700,
                  }}
                >
                  {loading ? <Loader2 size={18} className="spin" /> : <ShieldCheck size={18} />}
                  Confirm & Complete Verification
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <div>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            Authenticate directly through Ethiopia's official <strong>Fayda eSignet</strong> OpenID Connect portal.
            You will be redirected securely to the national authority platform.
          </p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleOidcRedirect}
            disabled={loading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              backgroundColor: '#0F766E',
            }}
          >
            {loading ? <Loader2 size={18} className="spin" /> : <ExternalLink size={18} />}
            Continue to Fayda eSignet Portal
          </button>
        </div>
      )}
    </div>
  );
};
