import { useState, useEffect, FC } from 'react';
import {
  CheckCircle2,
  XCircle,
  PauseCircle,
  ExternalLink,
  RefreshCw,
  Loader2,
  Eye,
  MousePointer,
  Tag,
  AlertCircle,
  Calendar,
  Image,
} from 'lucide-react';
import { getAllAdCampaignsApi, updateAdCampaignStatusApi } from '../../services/api';

interface Campaign {
  id: string;
  title: string;
  description?: string | null;
  bannerUrl: string;
  targetUrl?: string | null;
  placement: string;
  status: string;
  startDate?: string | null;
  endDate?: string | null;
  impressionsCount: number;
  clicksCount: number;
  createdAt: string;
  business?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  package?: {
    id: string;
    name: string;
    price: number;
    durationDays: number;
  } | null;
}

export const AdminCampaignManager: FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const fetchCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllAdCampaignsApi();
      setCampaigns(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleStatusChange = async (campaignId: string, status: 'ACTIVE' | 'REJECTED' | 'PAUSED') => {
    setActionLoading(campaignId);
    try {
      await updateAdCampaignStatusApi(campaignId, status);
      await fetchCampaigns();
    } catch (err: any) {
      alert(err?.response?.data?.message || `Failed to update campaign status`);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; color: string; label: string }> = {
      ACTIVE: { bg: '#DCFCE7', color: '#166534', label: 'Active' },
      PENDING_REVIEW: { bg: '#FEF3C7', color: '#92400E', label: 'Pending Review' },
      PAUSED: { bg: '#E0E7FF', color: '#3730A3', label: 'Paused' },
      REJECTED: { bg: '#FEE2E2', color: '#991B1B', label: 'Rejected' },
      DRAFT: { bg: '#F1F5F9', color: '#475569', label: 'Draft' },
      COMPLETED: { bg: '#F0FDF4', color: '#15803D', label: 'Completed' },
    };
    const s = styles[status] || { bg: '#F1F5F9', color: '#475569', label: status };
    return (
      <span
        style={{
          display: 'inline-block',
          padding: '0.25rem 0.6rem',
          borderRadius: '6px',
          fontSize: '0.75rem',
          fontWeight: 700,
          backgroundColor: s.bg,
          color: s.color,
        }}
      >
        {s.label}
      </span>
    );
  };

  const formatDate = (d?: string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filtered = filterStatus === 'ALL' ? campaigns : campaigns.filter((c) => c.status === filterStatus);

  const statusCounts = campaigns.reduce<Record<string, number>>((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="panel-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.5rem', justifyContent: 'center' }}>
          <Loader2 size={18} className="spin" style={{ color: 'var(--color-accent)' }} />
          <span style={{ fontSize: '0.9rem', color: '#64748B' }}>Loading advertising campaigns...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#991B1B', fontSize: '0.9rem' }}>
            <AlertCircle size={16} /> {error}
          </div>
          <button onClick={fetchCampaigns} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="panel-card">
      <div className="panel-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 className="panel-title">
            <Tag size={18} style={{ marginRight: '0.5rem', verticalAlign: 'text-bottom' }} />
            Advertising Campaign Management
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
            Review, approve, or pause business advertising campaigns ({campaigns.length} total)
          </p>
        </div>
        <button onClick={fetchCampaigns} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem', padding: '0 0.25rem' }}>
        {[
          { key: 'ALL', label: `All (${campaigns.length})` },
          { key: 'PENDING_REVIEW', label: `Pending (${statusCounts['PENDING_REVIEW'] || 0})` },
          { key: 'ACTIVE', label: `Active (${statusCounts['ACTIVE'] || 0})` },
          { key: 'PAUSED', label: `Paused (${statusCounts['PAUSED'] || 0})` },
          { key: 'REJECTED', label: `Rejected (${statusCounts['REJECTED'] || 0})` },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilterStatus(f.key)}
            className={`btn btn-sm ${filterStatus === f.key ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.78rem', padding: '0.3rem 0.7rem' }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#64748B', fontSize: '0.9rem' }}>
          No campaigns match the selected filter.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Business</th>
                <th>Placement</th>
                <th>Package</th>
                <th>Dates</th>
                <th style={{ textAlign: 'center' }}>Impressions</th>
                <th style={{ textAlign: 'center' }}>Clicks</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ maxWidth: '220px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.15rem' }}>{c.title}</div>
                      {c.description && (
                        <div style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.description}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.3rem' }}>
                        {c.bannerUrl && (
                          <a
                            href={c.bannerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: '0.7rem', color: 'var(--color-accent)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                          >
                            <Image size={10} /> Banner
                          </a>
                        )}
                        {c.targetUrl && (
                          <a
                            href={c.targetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: '0.7rem', color: 'var(--color-accent)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                          >
                            <ExternalLink size={10} /> URL
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    {c.business ? (
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.business.firstName} {c.business.lastName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{c.business.email}</div>
                      </div>
                    ) : (
                      <span style={{ color: '#94A3B8' }}>—</span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.78rem', backgroundColor: '#F1F5F9', padding: '0.2rem 0.45rem', borderRadius: '4px' }}>
                      {c.placement}
                    </span>
                  </td>
                  <td>
                    {c.package ? (
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{c.package.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                          {c.package.durationDays}d · ETB {c.package.price.toLocaleString()}
                        </div>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>No package</span>
                    )}
                  </td>
                  <td>
                    <div style={{ fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar size={10} /> {formatDate(c.startDate)}
                      </span>
                      <span style={{ color: '#94A3B8' }}>→ {formatDate(c.endDate)}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', fontWeight: 600 }}>
                      <Eye size={12} style={{ color: '#64748B' }} /> {c.impressionsCount.toLocaleString()}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', fontWeight: 600 }}>
                      <MousePointer size={12} style={{ color: '#64748B' }} /> {c.clicksCount.toLocaleString()}
                    </div>
                  </td>
                  <td>{getStatusBadge(c.status)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {actionLoading === c.id ? (
                        <Loader2 size={14} className="spin" style={{ color: 'var(--color-accent)' }} />
                      ) : (
                        <>
                          {(c.status === 'PENDING_REVIEW' || c.status === 'PAUSED' || c.status === 'REJECTED') && (
                            <button
                              onClick={() => handleStatusChange(c.id, 'ACTIVE')}
                              className="btn btn-sm"
                              style={{
                                fontSize: '0.72rem',
                                padding: '0.25rem 0.5rem',
                                backgroundColor: '#DCFCE7',
                                color: '#166534',
                                border: '1px solid #BBF7D0',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.2rem',
                              }}
                              title="Approve campaign"
                            >
                              <CheckCircle2 size={11} /> Approve
                            </button>
                          )}
                          {c.status === 'ACTIVE' && (
                            <button
                              onClick={() => handleStatusChange(c.id, 'PAUSED')}
                              className="btn btn-sm"
                              style={{
                                fontSize: '0.72rem',
                                padding: '0.25rem 0.5rem',
                                backgroundColor: '#E0E7FF',
                                color: '#3730A3',
                                border: '1px solid #C7D2FE',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.2rem',
                              }}
                              title="Pause campaign"
                            >
                              <PauseCircle size={11} /> Pause
                            </button>
                          )}
                          {(c.status === 'PENDING_REVIEW' || c.status === 'ACTIVE') && (
                            <button
                              onClick={() => handleStatusChange(c.id, 'REJECTED')}
                              className="btn btn-sm"
                              style={{
                                fontSize: '0.72rem',
                                padding: '0.25rem 0.5rem',
                                backgroundColor: '#FEE2E2',
                                color: '#991B1B',
                                border: '1px solid #FECACA',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.2rem',
                              }}
                              title="Reject campaign"
                            >
                              <XCircle size={11} /> Reject
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
