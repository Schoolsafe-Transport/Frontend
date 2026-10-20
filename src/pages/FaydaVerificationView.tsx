import { useState, FC, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  FileText,
  Lock,
} from 'lucide-react';
import { verifyFaydaFinApi, getFaydaAuthUrlApi } from '../services/api';

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
  const [finNumber, setFinNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleVerifyFin = async (e: FormEvent) => {
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
      const res = await verifyFaydaFinApi(cleanFin, otp || undefined);
      if (res.success) {
        setSuccess('Fayda National ID verified successfully! Your guardian account is now verified.');
        await refreshUser();
        setTimeout(() => {
          onSuccess();
        }, 1200);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Verification failed. Please check your Fayda FIN number and try again.'
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
        <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <span>{success}</span>
        </div>
      )}

      {/* Verification Method Switcher */}
      <div
        style={{
          display: 'flex',
          backgroundColor: '#F1F5F9',
          padding: '4px',
          borderRadius: '10px',
          marginBottom: '1.5rem',
        }}
      >
        <button
          type="button"
          style={{
            flex: 1,
            padding: '0.75rem',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            backgroundColor: method === 'FIN' ? '#FFFFFF' : 'transparent',
            color: method === 'FIN' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            boxShadow: method === 'FIN' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
            transition: 'all 0.15s ease',
          }}
          onClick={() => {
            setMethod('FIN');
            setError(null);
          }}
        >
          12-Digit FIN Number
        </button>
        <button
          type="button"
          style={{
            flex: 1,
            padding: '0.75rem',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            backgroundColor: method === 'OIDC' ? '#FFFFFF' : 'transparent',
            color: method === 'OIDC' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            boxShadow: method === 'OIDC' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
            transition: 'all 0.15s ease',
          }}
          onClick={() => {
            setMethod('OIDC');
            setError(null);
          }}
        >
          Fayda eSignet (OIDC)
        </button>
      </div>

      {method === 'FIN' ? (
        <form onSubmit={handleVerifyFin} className="auth-form">
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
            Enter your 12-digit Ethiopian Fayda Identification Number (FIN) printed on your National Digital ID card or Fayda app.
          </p>

          <div className="form-group">
            <label htmlFor="fin-input">Fayda FIN Number *</label>
            <input
              id="fin-input"
              type="text"
              className="form-input"
              placeholder="e.g. 1234 5678 9012"
              value={finNumber}
              onChange={(e) => setFinNumber(e.target.value)}
              style={{ letterSpacing: '1.5px', fontFamily: 'monospace', fontSize: '1.05rem' }}
              required
              autoFocus
            />
            <span className="form-hint">
              12 numeric digits (or 16-digit VID virtual identifier).
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="otp-input">Fayda SMS OTP (Optional)</label>
            <input
              id="otp-input"
              type="text"
              className="form-input"
              placeholder="e.g. 123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={8}
            />
            <span className="form-hint">
              Leave blank if verifying in standard sandbox mode.
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: '100%', gap: '0.5rem' }}
            >
              {loading ? <Loader2 size={18} className="spin" /> : <ShieldCheck size={18} />}
              {loading ? 'Verifying with National Authority...' : 'Verify Identity with Fayda'}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={onSkipToDashboard}
              style={{ width: '100%' }}
            >
              Browse Routes First (Verify Later)
            </button>
          </div>
        </form>
      ) : (
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            Authenticate through Ethiopia's official <strong>Fayda eSignet</strong> OpenID Connect portal
            using your registered biometric or mobile phone credentials.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={handleOidcRedirect}
              disabled={loading}
              style={{ width: '100%', backgroundColor: '#0F766E', gap: '0.5rem' }}
            >
              {loading ? <Loader2 size={18} className="spin" /> : <ExternalLink size={18} />}
              {loading ? 'Connecting to eSignet Portal...' : 'Continue to Fayda eSignet Portal'}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={onSkipToDashboard}
              style={{ width: '100%' }}
            >
              Browse Routes First (Verify Later)
            </button>
          </div>
        </div>
      )}

      {/* Ethiopian Security Footnote */}
      <div
        style={{
          marginTop: '2rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.75rem',
          color: 'var(--color-text-secondary)',
        }}
      >
        <FileText size={16} style={{ flexShrink: 0, color: 'var(--color-accent)' }} />
        <span>
          National ID verification in development/sandbox mode utilizes verified test FIN records.
          In production environments, authorized eSignet OIDC credentials from the National ID Authority are enforced.
        </span>
      </div>
    </div>
  );
};
