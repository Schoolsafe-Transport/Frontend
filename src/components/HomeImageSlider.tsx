import { useState, useEffect, FC } from 'react';
import { ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';

interface SlideItem {
  src: string;
  title: string;
  subtitle: string;
}

const SLIDES: SlideItem[] = [
  {
    src: '/actors/schoolB.jpg',
    title: 'Modern School Transit Fleet',
    subtitle: 'Safety inspected vehicles for daily school commutes',
  },
  {
    src: '/actors/DriverB.jpg',
    title: 'Verified Professional Operators',
    subtitle: 'Background-checked, licensed, and trained drivers',
  },
  {
    src: '/actors/Stud.jpg',
    title: 'Student QR Pass Boarding',
    subtitle: 'Automated boarding confirmation for parents',
  },
  {
    src: '/actors/PRStu.jpg',
    title: 'Peace of Mind for Families',
    subtitle: 'Direct notifications and live transit tracking',
  },
  {
    src: '/actors/STDB.jpg',
    title: 'Safe School Arrival',
    subtitle: 'Dedicated pickup stops and on-time delivery',
  },
  {
    src: '/actors/sst.jpg',
    title: 'Real-Time Safety Oversight',
    subtitle: 'Continuous route monitoring and immediate alerts',
  },
];

export const HomeImageSlider: FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Preload all slide images into memory
  useEffect(() => {
    SLIDES.forEach((item) => {
      const img = new Image();
      img.src = item.src;
    });
  }, []);

  // Self-advancing timer, pauses on user hover
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [isPaused]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
  };

  const currentSlide = SLIDES[currentIndex];

  return (
    <div
      className="home-slider-card"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{
        position: 'relative',
        width: '100%',
        height: '460px',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
        backgroundColor: '#0F172A',
      }}
    >
      {/* Live Status Badge */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 10,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '30px',
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          color: '#FFFFFF',
          fontSize: '0.8rem',
          fontWeight: 600,
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#10B981',
            boxShadow: '0 0 10px #10B981',
            display: 'inline-block',
            animation: 'pulse 2s infinite',
          }}
        />
        <span>Verified School Transit in Motion</span>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={handlePrev}
        aria-label="Previous slide"
        style={{
          position: 'absolute',
          left: '14px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 10,
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(6px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.95)';
          e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.7)';
          e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
        }}
      >
        <ChevronLeft size={20} />
      </button>

      <button
        onClick={handleNext}
        aria-label="Next slide"
        style={{
          position: 'absolute',
          right: '14px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 10,
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(6px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.95)';
          e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.7)';
          e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
        }}
      >
        <ChevronRight size={20} />
      </button>

      {/* Image Slides Viewport */}
      <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
        {SLIDES.map((slide, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={slide.src}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                opacity: isActive ? 1 : 0,
                visibility: isActive ? 'visible' : 'hidden',
                transition: 'opacity 0.6s ease-in-out',
                zIndex: isActive ? 2 : 1,
                pointerEvents: isActive ? 'auto' : 'none',
              }}
            >
              <img
                src={slide.src}
                alt={slide.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  transform: isActive ? 'scale(1.03)' : 'scale(1)',
                  transition: 'transform 4.5s ease-out',
                }}
                loading={index === 0 ? 'eager' : 'lazy'}
                onError={(e) => {
                  // Fallback if image path has issue
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          );
        })}

        {/* Unified Bottom Dark Gradient & Slide Caption - No Ghosting */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(15, 23, 42, 0.92) 0%, rgba(15, 23, 42, 0.4) 45%, rgba(15, 23, 42, 0.05) 100%)',
            pointerEvents: 'none',
            zIndex: 3,
          }}
        />

        <div
          key={currentIndex}
          style={{
            position: 'absolute',
            bottom: '44px',
            left: '20px',
            right: '20px',
            zIndex: 4,
            color: '#FFFFFF',
            pointerEvents: 'none',
            textShadow: '0 2px 4px rgba(0,0,0,0.6)',
            animation: 'fadeInCaption 0.4s ease-out',
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#6EE7B7', fontWeight: 600, marginBottom: '4px' }}>
            <ShieldCheck size={14} /> SchoolSafe Verified Transit
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 4px', color: '#FFFFFF' }}>
            {currentSlide.title}
          </h3>
          <p style={{ fontSize: '0.875rem', margin: 0, color: 'rgba(255, 255, 255, 0.85)' }}>
            {currentSlide.subtitle}
          </p>
        </div>

        {/* Interactive Pagination Indicators */}
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            zIndex: 10,
          }}
        >
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              style={{
                width: idx === currentIndex ? '30px' : '8px',
                height: '8px',
                borderRadius: '4px',
                backgroundColor: idx === currentIndex ? '#FFFFFF' : 'rgba(255, 255, 255, 0.45)',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transition: 'all 0.35s ease',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

