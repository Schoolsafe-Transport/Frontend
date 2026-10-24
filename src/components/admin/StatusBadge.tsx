import type { FC } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  PauseCircle,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface StatusBadgeProps {
  status: string | boolean;
  type?: 'status' | 'verification' | 'email';
}

export const StatusBadge: FC<StatusBadgeProps> = ({ status, type = 'status' }) => {
  if (type === 'verification' || typeof status === 'boolean') {
    const isVerified = Boolean(status);
    return isVerified ? (
      <span className="admin-badge admin-badge-approved">
        <ShieldCheck size={12} /> Verified
      </span>
    ) : (
      <span className="admin-badge admin-badge-pending">
        <Clock size={12} /> Unverified
      </span>
    );
  }

  const s = String(status || '').toUpperCase();

  switch (s) {
    case 'ACTIVE':
    case 'APPROVED':
    case 'PAID':
    case 'RESOLVED':
    case 'COMPLETED':
      return (
        <span className="admin-badge admin-badge-approved">
          <CheckCircle2 size={12} /> {s.replace('_', ' ')}
        </span>
      );

    case 'PENDING':
    case 'PENDING_REVIEW':
    case 'UNDER_REVIEW':
    case 'SCHEDULED':
      return (
        <span className="admin-badge admin-badge-pending">
          <Clock size={12} /> {s.replace('_', ' ')}
        </span>
      );

    case 'REJECTED':
    case 'DISMISSED':
    case 'CANCELLED':
    case 'FAILED':
      return (
        <span className="admin-badge admin-badge-rejected">
          <XCircle size={12} /> {s.replace('_', ' ')}
        </span>
      );

    case 'SUSPENDED':
    case 'PAUSED':
    case 'INACTIVE':
      return (
        <span className="admin-badge admin-badge-suspended">
          <PauseCircle size={12} /> {s.replace('_', ' ')}
        </span>
      );

    case 'IN_PROGRESS':
    case 'BOARDED':
      return (
        <span className="admin-badge admin-badge-info">
          <Check size={12} /> IN PROGRESS
        </span>
      );

    default:
      return (
        <span className="admin-badge admin-badge-info">
          {s || 'UNKNOWN'}
        </span>
      );
  }
};
