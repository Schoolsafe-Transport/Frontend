import { useState, useEffect, FC } from 'react';

const IMAGES: string[] = [
  '/actors/schoolB.jpg',
  '/actors/DriverB.jpg',
  '/actors/Stud.jpg',
  '/actors/PRStu.jpg',
  '/actors/STDB.jpg',
  '/actors/sst.jpg',
];

export const HomeImageSlider: FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Automatically cycles images on its own (no user interaction required)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % IMAGES.length);
    }, 3500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="home-slider-card">
      <div className="slider-viewport">
        {IMAGES.map((src, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={src}
              className={`slider-slide ${isActive ? 'active' : ''}`}
              style={{
                opacity: isActive ? 1 : 0,
                transform: isActive ? 'scale(1)' : 'scale(1.04)',
              }}
            >
              <img
                src={src}
                alt={`School transportation showcase ${index + 1}`}
                className="slider-image"
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            </div>
          );
        })}

        {/* Subtle self-advancing indicators (visual only, not interactive) */}
        <div className="slider-indicators" aria-hidden="true">
          {IMAGES.map((_, idx) => (
            <span
              key={idx}
              className={`slider-indicator-dot ${idx === currentIndex ? 'active' : ''}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
