import type { FC } from 'react';
import { useEffect, useState } from 'react';
import {
  Megaphone,
  Search,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Eye,
  ExternalLink,
  X,
} from 'lucide-react';
import {
  getAdminCampaignsApi,
  reviewAdminCampaignApi,
  AdminCampaignRecord,
} from '../../services/api';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { RejectionModal } from '../../components/admin/RejectionModal';

export const AdminAdvertisementsPage: FC<{ onRefreshStats?: () => void }> = ({ onRefreshStats }) => {
  const [campaigns, setCampaigns] = useState<AdminCampaignRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING_REVIEW' | 'ACTIVE' | 'REJECTED' | 'PAUSED'>('PENDING_REVIEW');

  // Selected for preview modal
  const [previewCampaign, setPreviewCampaign] = useState<AdminCampaignRecord | null>(null);

  // Rejection modal target
  const [rejectionTarget, setRejectionTarget] = useState<AdminCampaignRecord | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const res = await getAdminCampaignsApi(params);
      setCampaigns(res.campaigns || []);
    } catch (err: any) {
      console.error('[AdminAdvertisements] Error loading campaigns:', err);
      setError(err?.response?.data?.message || 'Failed to retrieve advertising campaigns from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCampaigns();
  };

  const handleApprove = async (camp: AdminCampaignRecord) => {
    if (!window.confirm(`Approve advertising campaign "${camp.title}" and activate across SchoolSafe placements?`)) {
      return;
    }

    try {
      setActionLoadingId(camp.id);
      await reviewAdminCampaignApi(camp.id, { decision: 'APPROVE' });
      setToastMessage({
        type: 'success',
        text: `Advertising campaign "${camp.title}" has been APPROVED and is now active.`,
      });
      await fetchCampaigns();
      if (onRefreshStats) onRefreshStats();
      if (previewCampaign && previewCampaign.id === camp.id) {
        setPreviewCampaign((prev) => (prev ? { ...prev, status: 'ACTIVE' } : null));
      }
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to approve campaign.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmRejection = async (reason: string) => {
    if (!rejectionTarget) return;

    try {
      setActionLoadingId(rejectionTarget.id);
      await reviewAdminCampaignApi(rejectionTarget.id, { decision: 'REJECT', reason });
      setToastMessage({
        type: 'success',
        text: `Campaign "${rejectionTarget.title}" has been REJECTED. Rejection reason recorded and merchant notified.`,
      });
      setRejectionTarget(null);
      await fetchCampaigns();
      if (onRefreshStats) onRefreshStats();
      if (previewCampaign && previewCampaign.id === rejectionTarget.id) {
        setPreviewCampaign((prev) => (prev ? { ...prev, status: 'REJECTED' } : null));
      }
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to reject campaign.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingCount = campaigns.filter((c) => c.status === 'PENDING_REVIEW').length;

  return (
    <div>
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="admin-toast-container">
          <div className={`admin-toast ${toastMessage.type === 'success' ? 'admin-toast-success' : 'admin-toast-error'}`}>
            {toastMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span>{toastMessage.text}</span>
            <button
              style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', marginLeft: 'auto' }}
              onClick={() => setToastMessage(null)}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      <RejectionModal
        isOpen={Boolean(rejectionTarget)}
        title="Reject Advertising Campaign"
        itemDescription={rejectionTarget ? `Campaign: "${rejectionTarget.title}"` : undefined}
        placeholder="State reason for rejecting this advertising banner (e.g. content policy violation, misleading imagery, broken destination URL)..."
        onClose={() => setRejectionTarget(null)}
        onConfirm={handleConfirmRejection}
      />

      {/* Main Card */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">
              <Megaphone size={20} style={{ color: '#2563EB' }} />
              Advertising Campaign Approvals & Management ({campaigns.length})
            </h2>
            <p className="admin-card-desc">
              Audit commercial banner creatives, verify target URLs, and approve eligible advertiser placements
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search
                size={16}
                style={{ position: 'absolute', left: '12px', top: '11px', color: '#94A3B8' }}
              />
              <input
                type="text"
                className="admin-search-input"
                placeholder="Search campaign, business..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="admin-btn admin-btn-secondary admin-btn-sm">
              Search
            </button>
          </form>
        </div>

        {/* Filter Bar */}
        <div className="admin-filter-bar">
          <div className="admin-tabs-group">
            <button
              className={`admin-tab-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setStatusFilter('ALL')}
            >
              All Campaigns
            </button>
            <button
              className={`admin-tab-btn ${statusFilter === 'PENDING_REVIEW' ? 'active' : ''}`}
              onClick={() => setStatusFilter('PENDING_REVIEW')}
            >
              Pending Review {pendingCount > 0 && `(${pendingCount})`}
            </button>
            <button
              className={`admin-tab-btn ${statusFilter === 'ACTIVE' ? 'active' : ''}`}
              onClick={() => setStatusFilter('ACTIVE')}
            >
              Active
            </button>
            <button
              className={`admin-tab-btn ${statusFilter === 'REJECTED' ? 'active' : ''}`}
              onClick={() => setStatusFilter('REJECTED')}
            >
              Rejected
            </button>
            <button
              className={`admin-tab-btn ${statusFilter === 'PAUSED' ? 'active' : ''}`}
              onClick={() => setStatusFilter('PAUSED')}
            >
              Paused
            </button>
          </div>

          <button
            className="admin-btn admin-btn-secondary admin-btn-sm"
            onClick={fetchCampaigns}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Campaign Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
            <Loader2 size={32} className="animate-spin" style={{ color: '#2563EB', margin: '0 auto 0.5rem' }} />
            <p style={{ color: '#64748B', fontSize: '0.875rem' }}>Loading campaigns...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#DC2626' }}>
            <AlertTriangle size={32} style={{ margin: '0 auto 0.5rem' }} />
            <p>{error}</p>
            <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={fetchCampaigns} style={{ marginTop: '0.5rem' }}>
              Retry
            </button>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">
              <Megaphone size={26} />
            </div>
            <h4>No Advertising Campaigns Found</h4>
            <p style={{ fontSize: '0.85rem' }}>
              {statusFilter === 'PENDING_REVIEW'
                ? 'All advertising campaigns have been reviewed. No pending campaigns in queue.'
                : 'No campaigns found matching your current filter.'}
            </p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Creative Preview & Title</th>
                  <th>Advertiser Business</th>
                  <th>Placement & Package</th>
                  <th>Impressions / Clicks</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((camp) => (
                  <tr key={camp.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '56px',
                            height: '38px',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            backgroundColor: '#F1F5F9',
                            border: '1px solid #E2E8F0',
                            flexShrink: 0,
                          }}
                        >
                          {camp.bannerUrl ? (
                            <img
                              src={camp.bannerUrl}
                              alt={camp.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                              <Megaphone size={16} />
                            </div>
                          )}
                        </div>
                        <div>
                          <strong style={{ color: '#0F172A', display: 'block', fontSize: '0.9rem' }}>
                            {camp.title}
                          </strong>
                          {camp.targetUrl && (
                            <a
                              href={camp.targetUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{ fontSize: '0.75rem', color: '#2563EB', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                            >
                              <span>{camp.targetUrl.replace(/^https?:\/\//, '').slice(0, 24)}...</span>
                              <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong style={{ color: '#1E40AF', display: 'block', fontSize: '0.85rem' }}>
                          {camp.business?.businessName || `${camp.business?.firstName} ${camp.business?.lastName}`}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                          {camp.business?.email}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#334155', display: 'block', fontSize: '0.8rem' }}>
                        {camp.placement.replace('_', ' ')}
                      </span>
                      {camp.package && (
                        <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
                          {camp.package.name} ({camp.package.durationDays} days)
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8rem', color: '#334155' }}>
                        <span style={{ fontWeight: 700 }}>{camp.impressionsCount.toLocaleString()}</span> views •{' '}
                        <span style={{ fontWeight: 700, color: '#2563EB' }}>{camp.clicksCount.toLocaleString()}</span> clicks
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={camp.status} />
                    </td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem', color: '#64748B' }}>
                      {new Date(camp.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                          onClick={() => setPreviewCampaign(camp)}
                          title="Preview Full Creative Banner and Target"
                        >
                          <Eye size={13} /> Preview
                        </button>

                        {camp.status === 'PENDING_REVIEW' && (
                          <>
                            <button
                              className="admin-btn admin-btn-success admin-btn-sm"
                              disabled={actionLoadingId === camp.id}
                              onClick={() => handleApprove(camp)}
                              title="Approve Campaign and Make Active"
                            >
                              Approve
                            </button>
                            <button
                              className="admin-btn admin-btn-danger admin-btn-sm"
                              disabled={actionLoadingId === camp.id}
                              onClick={() => setRejectionTarget(camp)}
                              title="Reject Campaign (State Reason)"
                            >
                              Reject
                            </button>
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

      {/* Campaign Creative Preview Modal */}
      {previewCampaign && (
        <div className="admin-modal-overlay" onClick={() => setPreviewCampaign(null)}>
          <div className="admin-modal" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3 className="admin-modal-title">
                  Campaign Creative Preview • {previewCampaign.title}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  Advertiser: {previewCampaign.business?.businessName || previewCampaign.business?.firstName}
                </span>
              </div>
              <button
                className="admin-btn admin-btn-secondary admin-btn-sm"
                onClick={() => setPreviewCampaign(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="admin-modal-body">
              {/* Banner Preview Box */}
              <div
                style={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#0F172A',
                  marginBottom: '1.25rem',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
              >
                <img
                  src={previewCampaign.bannerUrl}
                  alt={previewCampaign.title}
                  style={{ width: '100%', maxHeight: '280px', objectFit: 'contain', display: 'block' }}
                />
              </div>

              {/* Campaign Specifications */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Destination Target URL</span>
                  {previewCampaign.targetUrl ? (
                    <a
                      href={previewCampaign.targetUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: '0.85rem', color: '#2563EB', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem', wordBreak: 'break-all' }}
                    >
                      <span>{previewCampaign.targetUrl}</span>
                      <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>No external target link</span>
                  )}
                </div>

                <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Placement</span>
                  <strong style={{ fontSize: '0.85rem', color: '#0F172A' }}>{previewCampaign.placement.replace('_', ' ')}</strong>
                </div>

                <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Review Status</span>
                  <div style={{ marginTop: '0.2rem' }}>
                    <StatusBadge status={previewCampaign.status} />
                  </div>
                </div>

                <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Package</span>
                  <strong style={{ fontSize: '0.85rem', color: '#059669' }}>
                    {previewCampaign.package ? `${previewCampaign.package.name} (ETB ${previewCampaign.package.price})` : 'Standard Package'}
                  </strong>
                </div>
              </div>

              {previewCampaign.description && (
                <div style={{ padding: '0.75rem 1rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', fontWeight: 600 }}>Campaign Description:</span>
                  <p style={{ fontSize: '0.85rem', color: '#334155', margin: '0.25rem 0 0 0' }}>{previewCampaign.description}</p>
                </div>
              )}
            </div>

            <div className="admin-modal-footer">
              <button
                className="admin-btn admin-btn-secondary"
                onClick={() => setPreviewCampaign(null)}
              >
                Close Preview
              </button>

              {previewCampaign.status === 'PENDING_REVIEW' && (
                <>
                  <button
                    className="admin-btn admin-btn-danger"
                    onClick={() => {
                      setRejectionTarget(previewCampaign);
                    }}
                  >
                    Reject Creative
                  </button>
                  <button
                    className="admin-btn admin-btn-success"
                    disabled={actionLoadingId === previewCampaign.id}
                    onClick={() => handleApprove(previewCampaign)}
                  >
                    Approve & Make Live
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
