import { useState, useEffect, FC } from 'react';
import { ExternalLink, Tag, Bus, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { getActiveAdsApi, recordAdEventApi } from '../../services/api';

interface ActiveAdBannerProps {
  onFindTransportation?: () => void;
}

export const ActiveAdBanner: FC<ActiveAdBannerProps> = ({ onFindTransportation }) => {
  const [ads, setAds] = useState<any[]>([]);
  const [currentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const fetchAds = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const data = await getActiveAdsApi('DASHBOARD_BANNER');
      const validAds = Array.isArray(data) ? data : [];
      setAds(validAds);
      if (validAds.length > 0 && validAds[0]?.id) {
        // Record initial impression
        recordAdEventApi(validAds[0].id, 'IMPRESSION').catch(() => {});
      }
    } catch (err: any) {
      setApiError('Unable to load announcements at this moment.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const isValidHttpUrl = (url?: string | null): boolean => {
    if (!url) return false;
    try {
      const parsed = new URL(url, window.location.origin);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const isVideoUrl = (url?: string | null): boolean => {
    if (!url) return false;
    const l = url.toLowerCase();
    return l.endsWith('.mp4') || l.endsWith('.webm') || l.endsWith('.ogg') || l.startsWith('data:video/');
  };

  const currentAd = ads.length > 0 ? ads[currentIndex] : null;

  const handleAdClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentAd) {
      recordAdEventApi(currentAd.id, 'CLICK').catch(() => {});
      if (isValidHttpUrl(currentAd.targetUrl)) {
        window.open(currentAd.targetUrl, '_blank', 'noopener,noreferrer');
      }
    }
  };

  // State 1: Loading state — skeleton pulse (do not prematurely show Find Transportation)
  if (loading) {
    return (
      <div
        id="ad-banner-loading"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#FFFFFF',
          padding: '1rem 1.25rem',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          marginBottom: '1.25rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          opacity: 0.85,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Loader2 size={18} className="spin" style={{ color: 'var(--color-accent)' }} />
          <span style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: 500 }}>
            Checking community notices and transport opportunities...
          </span>
        </div>
      </div>
    );
  }

  // State 3: API failure — show graceful error with retry button (do not treat as zero ads)
  if (apiError) {
    return (
      <div
        id="ad-banner-error"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#FEF2F2',
          border: '1px solid #FECACA',
          padding: '0.75rem 1.25rem',
          borderRadius: '12px',
          marginBottom: '1.25rem',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#991B1B', fontSize: '0.85rem' }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{apiError}</span>
        </div>
        <button
          onClick={fetchAds}
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
        >
          <RefreshCw size={13} /> Retry
        </button>
      </div>
    );
  }

  // State 2: Successful response with zero eligible advertisements — display "Find Transportation" card
  if (!currentAd) {
    return (
      <div
        id="find-transportation-fallback-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#FFFFFF',
          padding: '1.25rem 1.5rem',
          borderRadius: '14px',
          border: '1.5px solid #BFDBFE',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #EFF6FF 100%)',
          marginBottom: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.08), 0 2px 4px -2px rgba(37, 99, 235, 0.05)',
          gap: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '280px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#DBEAFE',
              color: '#1D4ED8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Bus size={24} />
          </div>
          <div>
            <h3
              style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                margin: '0 0 0.35rem 0',
                color: 'var(--color-primary)',
              }}
            >
              Find Safe School Transportation
            </h3>
            <p
              style={{
                fontSize: '0.875rem',
                color: '#475569',
                margin: 0,
                lineHeight: 1.45,
              }}
            >
              Find school transport providers by location, school, school branch, vehicle type, price, and available seats.
            </p>
          </div>
        </div>

        <button
          id="btn-find-transportation-card"
          className="btn btn-primary"
          onClick={onFindTransportation}
          style={{
            padding: '0.75rem 1.5rem',
            fontWeight: 700,
            fontSize: '0.925rem',
            boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.25)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            whiteSpace: 'nowrap',
          }}
        >
          <Bus size={18} />
          Find Transportation
        </button>
      </div>
    );
  }

  // State 4: Eligible advertisements exist — display the sponsored banner
  return (
    <div
      id={`sponsored-ad-banner-${currentAd.id}`}
      onClick={handleAdClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        padding: '0.9rem 1.25rem',
        borderRadius: '12px',
        border: '1.5px solid #E2E8F0',
        marginBottom: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        cursor: isValidHttpUrl(currentAd.targetUrl) ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        gap: '1rem',
        flexWrap: 'wrap',
      }}
      onMouseEnter={(e) => {
        if (isValidHttpUrl(currentAd.targetUrl)) {
          e.currentTarget.style.borderColor = 'var(--color-accent)';
          e.currentTarget.style.boxShadow = '0 6px 12px -2px rgba(0,0,0,0.08)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#E2E8F0';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: '260px' }}>
        {/* Media creative: Video or Image */}
        {currentAd.bannerUrl && (
          isVideoUrl(currentAd.bannerUrl) ? (
            <video
              src={currentAd.bannerUrl}
              autoPlay
              muted
              loop
              playsInline
              style={{
                width: '64px',
                height: '44px',
                borderRadius: '6px',
                objectFit: 'cover',
                border: '1px solid #E2E8F0',
                flexShrink: 0,
                backgroundColor: '#000000',
              }}
            />
          ) : (
            <img
              src={currentAd.bannerUrl}
              alt={currentAd.title}
              style={{
                width: '56px',
                height: '42px',
                borderRadius: '6px',
                objectFit: 'cover',
                border: '1px solid #E2E8F0',
                flexShrink: 0,
              }}
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          )
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: '#0284C7',
                backgroundColor: '#E0F2FE',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <Tag size={10} /> Sponsored
            </span>
            <span style={{ fontSize: '0.925rem', fontWeight: 700, color: '#1E293B' }}>
              {currentAd.title}
            </span>
          </div>
          {currentAd.description && (
            <span style={{ fontSize: '0.825rem', color: '#64748B', lineHeight: 1.35 }}>
              {currentAd.description}
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={handleAdClick}
        style={{
          fontSize: '0.825rem',
          fontWeight: 700,
          color: 'var(--color-accent)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          flexShrink: 0,
          padding: '0.5rem 0.95rem',
        }}
      >
        View Offer <ExternalLink size={13} />
      </button>
    </div>
  );
};
