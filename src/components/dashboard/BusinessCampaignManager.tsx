import { useState, useEffect, FC } from 'react';
import {
  Plus,
  Eye,
  MousePointer,
  Tag,
  ExternalLink,
  RefreshCw,
  Loader2,
  AlertCircle,
  Calendar,
  X,
  Image,
  FileText,
  TrendingUp,
  CheckCircle2,
  UploadCloud,
  Link2,
} from 'lucide-react';
import {
  getMyAdCampaignsApi,
  getAdPackagesApi,
  createAdCampaignApi,
} from '../../services/api';

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
  package?: {
    id: string;
    name: string;
    price: number;
    durationDays: number;
  } | null;
}

interface AdPackage {
  id: string;
  name: string;
  description: string;
  durationDays: number;
  price: number;
  placement: string;
  isFeatured: boolean;
}

export const BusinessCampaignManager: FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [packages, setPackages] = useState<AdPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [campaignsData, packagesData] = await Promise.all([
        getMyAdCampaignsApi(),
        getAdPackagesApi(),
      ]);
      setCampaigns(Array.isArray(campaignsData) ? campaignsData : []);
      setPackages(Array.isArray(packagesData) ? packagesData : []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Computed stats from real data
  const activeCampaigns = campaigns.filter((c) => c.status === 'ACTIVE');
  const pendingCampaigns = campaigns.filter((c) => c.status === 'PENDING_REVIEW');
  const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressionsCount, 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + c.clicksCount, 0);
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';

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

  return (
    <>
      {/* Real Stats from API */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span>Active Ads</span>
            <FileText size={18} style={{ color: 'var(--color-accent)' }} />
          </div>
          <div className="stat-value">{loading ? '...' : `${activeCampaigns.length} Active`}</div>
          <div className="stat-subtext">{loading ? '—' : `${pendingCampaigns.length} Pending Review`}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>Impressions</span>
            <Eye size={18} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div className="stat-value">{loading ? '...' : totalImpressions.toLocaleString()}</div>
          <div className="stat-subtext">Across all placements</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>Clicks (Engagement)</span>
            <MousePointer size={18} style={{ color: 'var(--color-success)' }} />
          </div>
          <div className="stat-value">{loading ? '...' : totalClicks.toLocaleString()}</div>
          <div className="stat-subtext">{ctr}% Click-Through Rate</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>Total Campaigns</span>
            <TrendingUp size={18} style={{ color: 'var(--color-warning)' }} />
          </div>
          <div className="stat-value">{loading ? '...' : campaigns.length}</div>
          <div className="stat-subtext">All time campaigns</div>
        </div>
      </div>

      {/* Campaign Table */}
      <div className="panel-card">
        <div className="panel-header">
          <div>
            <h3 className="panel-title">My Advertising Campaigns</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
              Manage your advertising campaigns across SchoolSafe
            </p>
          </div>
          <button
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', gap: '0.35rem' }}
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={16} /> Create Campaign
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', gap: '0.75rem' }}>
            <Loader2 size={18} className="spin" style={{ color: 'var(--color-accent)' }} />
            <span style={{ fontSize: '0.9rem', color: '#64748B' }}>Loading campaigns...</span>
          </div>
        ) : error ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#991B1B', fontSize: '0.9rem' }}>
              <AlertCircle size={16} /> {error}
            </div>
            <button onClick={fetchData} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <RefreshCw size={13} /> Retry
            </button>
          </div>
        ) : campaigns.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
            <Tag size={36} style={{ color: '#CBD5E1', marginBottom: '0.75rem' }} />
            <p style={{ fontSize: '1rem', fontWeight: 600, color: '#475569', margin: '0 0 0.35rem 0' }}>No campaigns yet</p>
            <p style={{ fontSize: '0.875rem', color: '#94A3B8', margin: '0 0 1rem 0' }}>
              Create your first advertising campaign to reach SchoolSafe families.
            </p>
            <button
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', gap: '0.35rem' }}
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={16} /> Create Campaign
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Campaign Title</th>
                  <th>Placement</th>
                  <th>Package</th>
                  <th>Dates</th>
                  <th style={{ textAlign: 'center' }}>Impressions</th>
                  <th style={{ textAlign: 'center' }}>Clicks</th>
                  <th>Status</th>
                  <th>Links</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div>
                        <strong style={{ fontSize: '0.875rem' }}>{c.title}</strong>
                        {c.description && (
                          <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.15rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {c.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.78rem', backgroundColor: '#F1F5F9', padding: '0.2rem 0.45rem', borderRadius: '4px' }}>
                        {c.placement}
                      </span>
                    </td>
                    <td>
                      {c.package ? (
                        <div style={{ fontSize: '0.82rem' }}>
                          <div style={{ fontWeight: 600 }}>{c.package.name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                            {c.package.durationDays}d · ETB {c.package.price.toLocaleString()}
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>—</span>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.78rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Calendar size={10} /> {formatDate(c.startDate)}
                        </div>
                        <div style={{ color: '#94A3B8' }}>→ {formatDate(c.endDate)}</div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.impressionsCount.toLocaleString()}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.clicksCount.toLocaleString()}</span>
                    </td>
                    <td>{getStatusBadge(c.status)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        {c.bannerUrl && (
                          <a href={c.bannerUrl} target="_blank" rel="noopener noreferrer" title="View banner">
                            <Image size={14} style={{ color: 'var(--color-accent)' }} />
                          </a>
                        )}
                        {c.targetUrl && (
                          <a href={c.targetUrl} target="_blank" rel="noopener noreferrer" title="Visit target URL">
                            <ExternalLink size={14} style={{ color: 'var(--color-accent)' }} />
                          </a>
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

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <CreateCampaignModal
          packages={packages}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            fetchData();
          }}
        />
      )}
    </>
  );
};

/* ─── Create Campaign Modal ─── */
const CreateCampaignModal: FC<{
  packages: AdPackage[];
  onClose: () => void;
  onCreated: () => void;
}> = ({ packages, onClose, onCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [packageId, setPackageId] = useState('');
  const [placement, setPlacement] = useState('DASHBOARD_BANNER');
  const [mediaMode, setMediaMode] = useState<'UPLOAD' | 'URL'>('UPLOAD');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setError('Media file is too large. Please select an image or video under 20MB.');
      return;
    }

    setError(null);
    setUploadedFileName(`${file.name} (${(file.size / 1024).toFixed(0)} KB)`);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setBannerUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const isVideoMedia = (url: string) => {
    const l = url.toLowerCase();
    return l.startsWith('data:video/') || l.endsWith('.mp4') || l.endsWith('.webm') || l.endsWith('.ogg');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || title.trim().length < 3) {
      setError('Campaign title must be at least 3 characters');
      return;
    }
    if (!bannerUrl.trim()) {
      setError('Media creative (image or video) is required');
      return;
    }
    if (!bannerUrl.startsWith('data:')) {
      try {
        new URL(bannerUrl);
      } catch {
        setError('Creative media URL must be a valid web address (http:// or https://)');
        return;
      }
    }
    if (targetUrl.trim()) {
      try {
        const parsed = new URL(targetUrl);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          setError('Target URL must use http or https');
          return;
        }
      } catch {
        setError('Target URL must be a valid URL');
        return;
      }
    }

    setSubmitting(true);
    try {
      await createAdCampaignApi({
        title: title.trim(),
        description: description.trim() || undefined,
        bannerUrl: bannerUrl.trim(),
        targetUrl: targetUrl.trim() || undefined,
        packageId: packageId || undefined,
        placement,
      });
      onCreated();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create campaign');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '0.75rem',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '94vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.15rem 1.25rem', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, backgroundColor: '#FFFFFF', zIndex: 10 }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1E293B' }}>
            <Plus size={18} style={{ verticalAlign: 'text-bottom', marginRight: '0.4rem', color: 'var(--color-accent)' }} />
            Create New Campaign
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: '#64748B' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.25rem' }}>
          {error && (
            <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem', color: '#991B1B', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} /> {error}
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: '#374151' }}>
              Campaign Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Back-to-School Stationery Sale"
              className="input"
              style={{ width: '100%' }}
              required
              minLength={3}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: '#374151' }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of your campaign offer"
              className="input"
              style={{ width: '100%', minHeight: '65px', resize: 'vertical' }}
              rows={2}
            />
          </div>

          {/* Media Source Mode Tabs (Upload vs URL) */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.45rem', color: '#374151' }}>
              Creative Media (Video or Image) *
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.65rem' }}>
              <button
                type="button"
                onClick={() => setMediaMode('UPLOAD')}
                style={{
                  flex: 1,
                  padding: '0.45rem 0.65rem',
                  borderRadius: '6px',
                  border: mediaMode === 'UPLOAD' ? '1.5px solid var(--color-accent)' : '1px solid #CBD5E1',
                  backgroundColor: mediaMode === 'UPLOAD' ? 'var(--color-accent-light)' : '#F8FAFC',
                  color: mediaMode === 'UPLOAD' ? 'var(--color-accent)' : '#475569',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  cursor: 'pointer',
                }}
              >
                <UploadCloud size={14} /> Upload File
              </button>
              <button
                type="button"
                onClick={() => setMediaMode('URL')}
                style={{
                  flex: 1,
                  padding: '0.45rem 0.65rem',
                  borderRadius: '6px',
                  border: mediaMode === 'URL' ? '1.5px solid var(--color-accent)' : '1px solid #CBD5E1',
                  backgroundColor: mediaMode === 'URL' ? 'var(--color-accent-light)' : '#F8FAFC',
                  color: mediaMode === 'URL' ? 'var(--color-accent)' : '#475569',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  cursor: 'pointer',
                }}
              >
                <Link2 size={14} /> Media Web Link
              </button>
            </div>

            {mediaMode === 'UPLOAD' ? (
              <div>
                <label
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1.25rem 1rem',
                    border: '1.5px dashed #CBD5E1',
                    borderRadius: '8px',
                    backgroundColor: '#F8FAFC',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <UploadCloud size={28} style={{ color: 'var(--color-accent)', marginBottom: '0.35rem' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                    Tap to Choose Image or Video File
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.15rem' }}>
                    PNG, JPG, WEBP or MP4, WEBM (Max 20MB)
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,video/mp4,video/webm"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                </label>
                {uploadedFileName && (
                  <div style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 600, marginTop: '0.35rem' }}>
                    ✓ Selected: {uploadedFileName}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://example.com/banner.png or .mp4, or YouTube video link"
                  className="input"
                  style={{ width: '100%' }}
                />
                <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.25rem' }}>
                  Accepts direct image/video links, YouTube, or Vimeo links.
                </div>
              </div>
            )}

            {/* Live Media Preview */}
            {bannerUrl && (
              <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: '#F1F5F9', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                    Creative Live Preview
                  </span>
                  <button
                    type="button"
                    onClick={() => { setBannerUrl(''); setUploadedFileName(null); }}
                    style={{ background: 'none', border: 'none', color: '#DC2626', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Clear Media
                  </button>
                </div>
                {isVideoMedia(bannerUrl) ? (
                  <video
                    src={bannerUrl}
                    controls
                    autoPlay
                    muted
                    loop
                    playsInline
                    style={{ width: '100%', maxHeight: '160px', borderRadius: '6px', backgroundColor: '#000000', objectFit: 'contain' }}
                  />
                ) : (
                  <img
                    src={bannerUrl}
                    alt="Creative Preview"
                    style={{ width: '100%', maxHeight: '160px', borderRadius: '6px', objectFit: 'contain', backgroundColor: '#FFFFFF' }}
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                )}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: '#374151' }}>
              Destination URL
            </label>
            <input
              type="url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://your-website.com/offer"
              className="input"
              style={{ width: '100%' }}
            />
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.25rem' }}>
              Where users go when they click "View Offer". Must be http or https.
            </div>
          </div>

          {/* Responsive Placement & Package Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: '#374151' }}>
                Placement
              </label>
              <select
                value={placement}
                onChange={(e) => setPlacement(e.target.value)}
                className="input"
                style={{ width: '100%' }}
              >
                <option value="DASHBOARD_BANNER">Dashboard Banner</option>
                <option value="LANDING_PAGE">Landing Page</option>
                <option value="SIDEBAR">Sidebar</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: '#374151' }}>
                Package (Optional)
              </label>
              <select
                value={packageId}
                onChange={(e) => setPackageId(e.target.value)}
                className="input"
                style={{ width: '100%' }}
              >
                <option value="">No package</option>
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} ({pkg.durationDays}d · ETB {pkg.price})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.65rem', borderTop: '1px solid #F1F5F9', flexWrap: 'wrap' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={submitting} style={{ minWidth: '100px' }}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', minWidth: '160px', justifyContent: 'center' }}
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="spin" /> Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} /> Submit for Review
                </>
              )}
            </button>
          </div>

          <div style={{ marginTop: '0.75rem', fontSize: '0.72rem', color: '#94A3B8', textAlign: 'center' }}>
            Your campaign will be reviewed by a SchoolSafe administrator before going live.
          </div>
        </form>
      </div>
    </div>
  );
};
