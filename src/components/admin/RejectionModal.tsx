import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

interface RejectionModalProps {
  isOpen: boolean;
  title: string;
  itemDescription?: string;
  placeholder?: string;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}

export const RejectionModal: FC<RejectionModalProps> = ({
  isOpen,
  title,
  itemDescription,
  placeholder = 'Provide a clear, actionable reason explaining why this application or record is being rejected...',
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setError(null);
      setSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('A rejection reason is strictly required by administrative compliance policies.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onConfirm(reason.trim());
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to submit rejection decision.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={18} />
            </div>
            <h3 className="admin-modal-title">{title}</h3>
          </div>
          <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body">
            {itemDescription && (
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                  color: '#475569',
                }}
              >
                Target Record: <strong>{itemDescription}</strong>
              </div>
            )}

            <label
              htmlFor="rejection-reason-textarea"
              style={{
                display: 'block',
                fontWeight: 600,
                fontSize: '0.85rem',
                color: '#334155',
                marginBottom: '0.5rem',
              }}
            >
              Rejection Reason <span style={{ color: '#DC2626' }}>*</span>
            </label>

            <textarea
              id="rejection-reason-textarea"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={placeholder}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                fontSize: '0.875rem',
                lineHeight: 1.5,
                resize: 'vertical',
                outline: 'none',
              }}
              disabled={submitting}
              autoFocus
            />

            {error && (
              <div
                style={{
                  color: '#DC2626',
                  fontSize: '0.825rem',
                  marginTop: '0.5rem',
                  fontWeight: 500,
                }}
              >
                {error}
              </div>
            )}

            <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.65rem' }}>
              Notice: This reason will be permanently stored in the audit log and dispatched to the applicant or provider via email/system notification.
            </p>
          </div>

          <div className="admin-modal-footer">
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="admin-btn admin-btn-danger"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Submitting Decision...</span>
                </>
              ) : (
                'Confirm Rejection'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
