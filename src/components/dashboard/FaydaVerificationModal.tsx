import { useState, FC } from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, ExternalLink, X, Loader2 } from 'lucide-react';
import { verifyFaydaFinApi, getFaydaAuthUrlApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface FaydaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
}

export const FaydaVerificationModal: FC<FaydaModalProps> = ({ isOpen, onClose, onVerified }) => {
  const { refreshUser } = useAuth();
  const [method, setMethod] = useState<'FIN' | 'OIDC'>('FIN');
  const [finNumber, setFinNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVerifyFin = async (e: React.FormEvent) => {
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
        setSuccess('Fayda National ID verified successfully! Your account is now officially verified.');
        await refreshUser();
        setTimeout(() => {
          onVerified();
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed. Please check your Fayda ID number.');
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
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem',
              }}
            >
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <span>{success}</span>
            </div>
          )}

          {/* Toggle Verification Tabs */}
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
              onClick={() => setMethod('FIN')}
            >
              12-Digit FIN Number
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
              onClick={() => setMethod('OIDC')}
            >
              Fayda eSignet (OIDC)
            </button>
          </div>

          {method === 'FIN' ? (
            <form onSubmit={handleVerifyFin}>
              <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1rem' }}>
                Enter your 12-digit Ethiopian Fayda Identification Number (FIN) printed on your National Digital ID card.
              </p>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: '#334155' }}>
                  Fayda FIN Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1234 5678 9012"
                  value={finNumber}
                  onChange={(e) => setFinNumber(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    letterSpacing: '1px',
                    fontFamily: 'monospace',
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: '#334155' }}>
                  Fayda SMS OTP (Optional)
                </label>
                <input
                  type="text"
                  placeholder="6-digit verification code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                  }}
                />
              </div>

              <button
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
                Verify Identity with Fayda
              </button>
            </form>
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
