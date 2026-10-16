import { useState, useEffect, FC } from 'react';
import { ExternalLink, Tag } from 'lucide-react';
import { getActiveAdsApi, recordAdEventApi } from '../../services/api';

export const ActiveAdBanner: FC = () => {
  const [ads, setAds] = useState<any[]>([]);
  const [currentIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchAds = async () => {
      try {
        const data = await getActiveAdsApi('DASHBOARD_BANNER');
        if (isMounted && data && data.length > 0) {
          setAds(data);
          // Record initial impression
          recordAdEventApi(data[0].id, 'IMPRESSION').catch(() => {});
        }
      } catch {
        // Fallback banner
      }
    };
    fetchAds();
    return () => {
      isMounted = false;
    };
  }, []);

  const currentAd = ads.length > 0 ? ads[currentIndex] : null;

  const handleAdClick = () => {
    if (currentAd) {
      recordAdEventApi(currentAd.id, 'CLICK').catch(() => {});
      if (currentAd.targetUrl) {
        window.open(currentAd.targetUrl, '_blank', 'noopener,noreferrer');
      }
    }
  };

  if (!currentAd) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#FFFFFF',
          padding: '0.85rem 1.25rem',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          marginBottom: '1.25rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
            }}
          >
            Partner
          </span>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E293B' }}>
            SafeTire Ethiopia • 15% fleet tire maintenance discount for verified SchoolSafe drivers
          </span>
        </div>
        <span
          style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--color-accent)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            cursor: 'pointer',
          }}
        >
          Learn More <ExternalLink size={13} />
        </span>
      </div>
    );
  }

  return (
    <div
      onClick={handleAdClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        padding: '0.85rem 1.25rem',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        marginBottom: '1.25rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-accent)';
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#E2E8F0';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E293B' }}>
          {currentAd.title}
        </span>
        {currentAd.description && (
          <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
            — {currentAd.description}
          </span>
        )}
      </div>

      <span
        style={{
          fontSize: '0.8rem',
          fontWeight: 600,
          color: 'var(--color-accent)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          flexShrink: 0,
        }}
      >
        View Offer <ExternalLink size={13} />
      </span>
    </div>
  );
};
