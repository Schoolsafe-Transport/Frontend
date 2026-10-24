import { FC, useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  School,
  MapPin,
  Play,
  Square,
  Navigation,
  Compass,
  Radio,
  Clock,
  Gauge,
  Layers,
  Satellite,
  AlertCircle,
} from 'lucide-react';
import { getSocket } from '../../services/socket';
import { getLatestTripLocationApi, recordTripLocationApi } from '../../services/api';

interface StopLocation {
  name: string;
  lat: number;
  lng: number;
  time?: string;
  type: 'pickup' | 'school' | 'hub';
}

interface LiveTrackingMapProps {
  tripId?: string;
  tripStatus?: string;
  routeName?: string;
  stops?: StopLocation[];
  driverName?: string;
  vehiclePlate?: string;
  isProvider?: boolean;
}

// Default Addis Ababa School Route waypoints (Bole -> Atlas -> Kazanchis -> British/Cambridge Academy)
const DEFAULT_ROUTE_STOPS: StopLocation[] = [
  { name: 'Bole Medhanealem Hub (Start)', lat: 8.9954, lng: 38.7885, time: '07:05 AM', type: 'hub' },
  { name: 'Atlas Hotel Stop (Pickup 1)', lat: 9.0062, lng: 38.7791, time: '07:18 AM', type: 'pickup' },
  { name: 'Kazanchis Total (Pickup 2)', lat: 9.0189, lng: 38.7663, time: '07:28 AM', type: 'pickup' },
  { name: 'Cambridge Academy Gate (School)', lat: 9.0305, lng: 38.7550, time: '07:45 AM', type: 'school' },
];

export const LiveTrackingMap: FC<LiveTrackingMapProps> = ({
  tripId = 'active-trip',
  tripStatus = 'IN_PROGRESS',
  routeName = 'Route #04: Bole ➔ Cambridge Academy',
  stops = DEFAULT_ROUTE_STOPS,
  driverName = 'Dawit Abebe',
  vehiclePlate = 'Toyota HiAce • 3-A2849',
  isProvider = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const busMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const simulationIntervalRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);

  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number }>({
    lat: stops[0]?.lat || 8.9954,
    lng: stops[0]?.lng || 38.7885,
  });
  const [speed, setSpeed] = useState<number>(32);
  const [heading, setHeading] = useState<number>(45);
  const [lastUpdated, setLastUpdated] = useState<string>('Just now');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isDeviceGps, setIsDeviceGps] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [simStepIndex, setSimStepIndex] = useState<number>(0);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Avoid duplicate initialization
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const startLat = stops[0]?.lat || 8.9954;
    const startLng = stops[0]?.lng || 38.7885;

    const map = L.map(mapContainerRef.current, {
      center: [startLat, startLng],
      zoom: 13,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // High quality OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    // Draw route line
    const latLngs: [number, number][] = stops.map((s) => [s.lat, s.lng]);
    const polyline = L.polyline(latLngs, {
      color: '#2563EB',
      weight: 5,
      opacity: 0.8,
      dashArray: '8, 8',
    }).addTo(map);
    routePolylineRef.current = polyline;

    // Render Stop Markers
    stops.forEach((stop, idx) => {
      let iconHtml = '';
      if (stop.type === 'school') {
        iconHtml = `
          <div style="background-color: #10B981; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.5); border: 2px solid white;">
            🏫
          </div>`;
      } else if (stop.type === 'hub') {
        iconHtml = `
          <div style="background-color: #6366F1; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(99, 102, 241, 0.5); border: 2px solid white; font-size: 12px; font-weight: bold;">
            A
          </div>`;
      } else {
        iconHtml = `
          <div style="background-color: #0284C7; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 8px rgba(2, 132, 199, 0.4); border: 2px solid white; font-size: 11px; font-weight: bold;">
            ${idx}
          </div>`;
      }

      const stopIcon = L.divIcon({
        className: 'custom-stop-marker',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([stop.lat, stop.lng], { icon: stopIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: inherit; padding: 4px;">
          <div style="font-weight: 700; color: #1E293B; font-size: 13px;">${stop.name}</div>
          <div style="color: #64748B; font-size: 11px; margin-top: 2px;">Scheduled: ${stop.time || 'N/A'}</div>
          <div style="margin-top: 4px; font-size: 10px; font-weight: 600; color: #0284C7;">Type: ${stop.type.toUpperCase()}</div>
        </div>
      `);
    });

    // Create Animated School Bus Marker
    const busIconHtml = `
      <div style="position: relative; width: 44px; height: 44px;">
        <div style="position: absolute; inset: 0; border-radius: 50%; background-color: rgba(245, 158, 11, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: absolute; top: 4px; left: 4px; width: 36px; height: 36px; border-radius: 50%; background-color: #F59E0B; border: 3px solid #FFFFFF; box-shadow: 0 4px 14px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 18px; color: #FFFFFF;">
          🚌
        </div>
      </div>
    `;

    const busIcon = L.divIcon({
      className: 'custom-bus-marker',
      html: busIconHtml,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    const busMarker = L.marker([startLat, startLng], {
      icon: busIcon,
      zIndexOffset: 1000,
    }).addTo(map);

    busMarker.bindPopup(`
      <div style="font-family: inherit; padding: 4px;">
        <div style="font-weight: 800; color: #B45309; font-size: 13px;">🚌 School Bus Live Position</div>
        <div style="font-weight: 600; color: #1E293B; font-size: 12px; margin-top: 2px;">${vehiclePlate}</div>
        <div style="color: #64748B; font-size: 11px;">Driver: ${driverName}</div>
      </div>
    `);

    busMarkerRef.current = busMarker;

    // Fit map bounds to encompass the full route
    map.fitBounds(polyline.getBounds(), { padding: [40, 40] });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [stops, vehiclePlate, driverName]);

  // Fetch initial location from PostgreSQL if recorded
  useEffect(() => {
    if (!tripId || tripId === 'active-trip') return;
    let isCancelled = false;

    getLatestTripLocationApi(tripId)
      .then((data) => {
        if (!isCancelled && data && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
          const initialPos = { lat: data.latitude, lng: data.longitude };
          setCurrentPosition(initialPos);
          if (data.speed !== undefined && data.speed !== null) setSpeed(data.speed);
          if (data.heading !== undefined && data.heading !== null) setHeading(data.heading);
          setLastUpdated(new Date(data.timestamp || Date.now()).toLocaleTimeString());

          if (busMarkerRef.current) {
            busMarkerRef.current.setLatLng([initialPos.lat, initialPos.lng]);
          }
          if (mapInstanceRef.current) {
            mapInstanceRef.current.panTo([initialPos.lat, initialPos.lng]);
          }
        }
      })
      .catch(() => {
        // Safe catch if no location logged yet
      });

    return () => {
      isCancelled = true;
    };
  }, [tripId]);

  // Subscribe to Live Socket.IO Trip Updates
  useEffect(() => {
    if (!tripId) return;

    try {
      const socket = getSocket();
      if (!socket.connected) {
        socket.connect();
      }

      socket.emit('join_trip', tripId);

      const handleLocationUpdate = (data: {
        tripId: string;
        latitude: number;
        longitude: number;
        speed?: number;
        heading?: number;
        timestamp?: string;
      }) => {
        if (data.tripId === tripId && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
          const newPos = { lat: data.latitude, lng: data.longitude };
          setCurrentPosition(newPos);
          if (data.speed !== undefined) setSpeed(data.speed);
          if (data.heading !== undefined) setHeading(data.heading);
          setLastUpdated(new Date().toLocaleTimeString());

          if (busMarkerRef.current) {
            busMarkerRef.current.setLatLng([newPos.lat, newPos.lng]);
          }
        }
      };

      socket.on('trip_location_update', handleLocationUpdate);

      return () => {
        socket.off('trip_location_update', handleLocationUpdate);
      };
    } catch (_err) {
      // Catch
    }
  }, [tripId]);

  // Real Device GPS Broadcast (HTML5 Geolocation API)
  const toggleDeviceGps = () => {
    if (isDeviceGps) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsDeviceGps(false);
      return;
    }

    if (!('geolocation' in navigator)) {
      setGpsError('Geolocation is not supported by your current browser.');
      return;
    }

    // Stop simulation if active
    if (isSimulating) {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = null;
      }
      setIsSimulating(false);
    }

    setGpsError(null);
    setIsDeviceGps(true);

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude, speed: geoSpeed, heading: geoHeading } = pos.coords;
        const currentSpeed = geoSpeed !== null && geoSpeed >= 0 ? Math.round(geoSpeed * 3.6) : 0;
        const currentHeading = geoHeading !== null && geoHeading >= 0 ? Math.round(geoHeading) : 0;

        setCurrentPosition({ lat: latitude, lng: longitude });
        setSpeed(currentSpeed);
        setHeading(currentHeading);
        setLastUpdated(new Date().toLocaleTimeString());

        if (busMarkerRef.current) {
          busMarkerRef.current.setLatLng([latitude, longitude]);
        }

        // 1. Broadcast over Socket.IO for immediate real-time parent tracking
        try {
          const socket = getSocket();
          socket.emit('driver_location', {
            tripId,
            latitude,
            longitude,
            speed: currentSpeed,
            heading: currentHeading,
            isSimulated: false,
          });
        } catch (_err) {
          // Socket error handled
        }

        // 2. Persist to PostgreSQL database via REST
        try {
          await recordTripLocationApi(tripId, {
            latitude,
            longitude,
            speed: currentSpeed,
            heading: currentHeading,
          });
        } catch (_err) {
          // REST error handled
        }
      },
      (err) => {
        setGpsError(`Device GPS Note: ${err.message || 'Location access permission required'}`);
        setIsDeviceGps(false);
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 15000,
      }
    );

    watchIdRef.current = watchId;
  };

  // Smooth transit simulation generator for providers or parent demos
  const toggleSimulation = () => {
    if (isSimulating) {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = null;
      }
      setIsSimulating(false);
      return;
    }

    // Stop device GPS if active
    if (isDeviceGps) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsDeviceGps(false);
    }

    setIsSimulating(true);
    setGpsError(null);

    // Build dense interpolation steps along the stops
    const denseWaypoints: { lat: number; lng: number }[] = [];
    for (let i = 0; i < stops.length - 1; i++) {
      const p1 = stops[i];
      const p2 = stops[i + 1];
      const stepsBetween = 15;
      for (let s = 0; s < stepsBetween; s++) {
        const ratio = s / stepsBetween;
        denseWaypoints.push({
          lat: p1.lat + (p2.lat - p1.lat) * ratio,
          lng: p1.lng + (p2.lng - p1.lng) * ratio,
        });
      }
    }
    denseWaypoints.push({ lat: stops[stops.length - 1].lat, lng: stops[stops.length - 1].lng });

    let step = simStepIndex;

    const interval = setInterval(() => {
      if (step >= denseWaypoints.length) {
        step = 0; // Loop or reach destination
      }

      const nextCoord = denseWaypoints[step];
      const simulatedSpeed = Math.floor(25 + Math.random() * 15);
      const simulatedHeading = Math.floor(Math.random() * 360);

      setCurrentPosition(nextCoord);
      setSpeed(simulatedSpeed);
      setHeading(simulatedHeading);
      setLastUpdated(new Date().toLocaleTimeString());
      setSimStepIndex(step + 1);

      if (busMarkerRef.current) {
        busMarkerRef.current.setLatLng([nextCoord.lat, nextCoord.lng]);
      }

      // Emit over Socket.IO so all other connected devices see the bus move live!
      try {
        const socket = getSocket();
        socket.emit('driver_location', {
          tripId,
          latitude: nextCoord.lat,
          longitude: nextCoord.lng,
          speed: simulatedSpeed,
          heading: simulatedHeading,
          isSimulated: true,
        });
      } catch (_err) {
        // Safe catch
      }

      step++;
    }, 1800);

    simulationIntervalRef.current = interval;
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = null;
      }
    };
  }, []);

  const handleRecenter = () => {
    if (mapInstanceRef.current && currentPosition) {
      mapInstanceRef.current.flyTo([currentPosition.lat, currentPosition.lng], 15, {
        animate: true,
        duration: 1,
      });
    }
  };

  return (
    <div className="panel-card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
      {/* Map Header / Live Status Bar */}
      <div
        style={{
          padding: '1rem 1.25rem',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            {isDeviceGps ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  backgroundColor: '#ECFDF5',
                  color: '#065F46',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  border: '1px solid #A7F3D0',
                }}
              >
                <Satellite size={12} className="animate-pulse" style={{ color: '#059669' }} />
                Live Satellite GPS Active
              </span>
            ) : isSimulating ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  backgroundColor: '#EFF6FF',
                  color: '#1E40AF',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  border: '1px solid #BFDBFE',
                }}
              >
                <Radio size={12} className="animate-pulse" style={{ color: '#2563EB' }} />
                Route Simulator Active
              </span>
            ) : (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  backgroundColor: '#F1F5F9',
                  color: '#475569',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                <Radio size={12} style={{ color: '#10B981' }} />
                Real-Time Telemetry Stream
              </span>
            )}

            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary)', margin: 0 }}>
              {routeName}
            </h3>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
            Vehicle: <strong>{vehiclePlate}</strong> • Driver: <strong>{driverName}</strong>
          </div>
        </div>

        {/* Live Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleRecenter}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}
            title="Center view on vehicle"
          >
            <Navigation size={14} /> Center Bus
          </button>

          {/* Provider / Driver Device GPS Button */}
          {isProvider && (
            <button
              onClick={toggleDeviceGps}
              className={`btn btn-sm ${isDeviceGps ? 'btn-danger' : 'btn-primary'}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.8rem',
                backgroundColor: isDeviceGps ? undefined : '#047857',
                borderColor: isDeviceGps ? undefined : '#047857',
              }}
              title="Broadcast real GPS coordinates from device location"
            >
              {isDeviceGps ? (
                <>
                  <Square size={14} /> Stop Device GPS
                </>
              ) : (
                <>
                  <Satellite size={14} /> Broadcast Real GPS
                </>
              )}
            </button>
          )}

          {/* Route Simulation button */}
          <button
            onClick={toggleSimulation}
            className={`btn btn-sm ${isSimulating ? 'btn-danger' : 'btn-secondary'}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}
            title={isProvider ? 'Simulate route movement for demonstrations' : 'Simulate live transit run'}
          >
            {isSimulating ? (
              <>
                <Square size={14} /> Stop Simulation
              </>
            ) : (
              <>
                <Play size={14} /> {isProvider ? 'Simulate Route' : 'Simulate Journey'}
              </>
            )}
          </button>
        </div>
      </div>

      {gpsError && (
        <div
          style={{
            padding: '0.6rem 1rem',
            backgroundColor: '#FEF2F2',
            color: '#B91C1C',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            borderBottom: '1px solid #FCA5A5',
          }}
        >
          <AlertCircle size={15} style={{ flexShrink: 0 }} />
          <span>{gpsError}</span>
        </div>
      )}

      {/* Map Canvas Container */}
      <div style={{ position: 'relative', width: '100%', height: '420px', backgroundColor: '#E2E8F0' }}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

        {/* Floating Telemetry HUD Overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            border: '1px solid rgba(226, 232, 240, 0.8)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Gauge size={16} style={{ color: '#0284C7' }} />
            <div>
              <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>SPEED</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>
                {tripStatus === 'COMPLETED' ? '0 km/h' : `${speed} km/h`}
              </div>
            </div>
          </div>

          <div style={{ width: '1px', height: '24px', backgroundColor: '#CBD5E1' }}></div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Compass size={16} style={{ color: '#F59E0B' }} />
            <div>
              <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>HEADING</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>
                {heading}° NNE
              </div>
            </div>
          </div>

          <div style={{ width: '1px', height: '24px', backgroundColor: '#CBD5E1' }}></div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={16} style={{ color: '#10B981' }} />
            <div>
              <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>TELEMETRY</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#059669' }}>
                {lastUpdated}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stop Sequence Breakdown Footer */}
      <div
        style={{
          padding: '1rem 1.25rem',
          backgroundColor: '#F8FAFC',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)' }}>
          <Layers size={14} /> Scheduled Transit Stops Along Route
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {stops.map((stop, i) => (
            <div
              key={i}
              style={{
                padding: '0.6rem 0.75rem',
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
              }}
            >
              {stop.type === 'school' ? (
                <School size={16} style={{ color: '#10B981', flexShrink: 0 }} />
              ) : (
                <MapPin size={16} style={{ color: '#0284C7', flexShrink: 0 }} />
              )}
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {stop.name}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>
                  ETA: {stop.time || 'In Route'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
