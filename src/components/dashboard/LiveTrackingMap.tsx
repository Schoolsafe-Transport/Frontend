import { FC, useEffect, useRef, useState, useCallback } from 'react';
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
  LocateFixed,
  RefreshCw,
  Crosshair,
} from 'lucide-react';
import { getSocket } from '../../services/socket';
import { getLatestTripLocationApi, recordTripLocationApi } from '../../services/api';

export interface StopLocation {
  name: string;
  lat: number;
  lng: number;
  time?: string;
  type: 'pickup' | 'school' | 'hub';
}

export interface LiveTrackingMapProps {
  tripId?: string;
  tripStatus?: string;
  routeName?: string;
  stops?: StopLocation[];
  driverName?: string;
  vehiclePlate?: string;
  isProvider?: boolean;
}

// Default reference route stops
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
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userAccuracyCircleRef = useRef<L.Circle | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const simulationIntervalRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);

  // Position state (defaults to first stop if real GPS not yet obtained)
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number }>({
    lat: stops[0]?.lat || 8.9954,
    lng: stops[0]?.lng || 38.7885,
  });

  // User's Real GPS Hardware Coordinates
  const [realGpsPosition, setRealGpsPosition] = useState<{
    lat: number;
    lng: number;
    accuracy: number | null;
    speed: number | null;
    heading: number | null;
    timestamp: number;
  } | null>(null);

  const [speed, setSpeed] = useState<number>(0);
  const [heading, setHeading] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<string>('Detecting location...');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isDeviceGps, setIsDeviceGps] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsAcquiring, setGpsAcquiring] = useState<boolean>(false);
  const [simStepIndex, setSimStepIndex] = useState<number>(0);

  // Helper: calculate distance between two coordinates in kilometers
  const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Update or create the Real User Location Leaflet Marker
  const updateUserLocationMarker = useCallback((lat: number, lng: number, accuracy: number | null) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const userHtml = `
      <div style="position: relative; width: 36px; height: 36px;">
        <div style="position: absolute; inset: -4px; border-radius: 50%; background-color: rgba(37, 99, 235, 0.35); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: absolute; top: 0; left: 0; width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #2563EB, #1D4ED8); border: 3px solid #FFFFFF; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.6); display: flex; align-items: center; justify-content: center; font-size: 16px; color: #FFFFFF;">
          📍
        </div>
      </div>
    `;

    const userIcon = L.divIcon({
      className: 'custom-real-gps-marker',
      html: userHtml,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([lat, lng]);
    } else {
      const marker = L.marker([lat, lng], {
        icon: userIcon,
        zIndexOffset: 1200,
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: inherit; padding: 4px; min-width: 170px;">
          <div style="font-weight: 800; color: #1D4ED8; font-size: 13px; display: flex; align-items: center; gap: 4px;">
            <span>📍 Real Device GPS Fix</span>
          </div>
          <div style="font-size: 11px; color: #475569; margin-top: 4px;">
            Lat: <strong>${lat.toFixed(5)}</strong>, Lng: <strong>${lng.toFixed(5)}</strong>
          </div>
          ${accuracy ? `<div style="font-size: 10px; color: #059669; margin-top: 2px;">Accuracy: ±${Math.round(accuracy)}m</div>` : ''}
          <div style="font-size: 10px; color: #64748B; margin-top: 2px;">Live Device Geolocation</div>
        </div>
      `);
      userMarkerRef.current = marker;
    }

    // Accuracy Circle
    if (accuracy && accuracy < 500) {
      if (userAccuracyCircleRef.current) {
        userAccuracyCircleRef.current.setLatLng([lat, lng]);
        userAccuracyCircleRef.current.setRadius(accuracy);
      } else {
        const circle = L.circle([lat, lng], {
          radius: accuracy,
          color: '#2563EB',
          fillColor: '#60A5FA',
          fillOpacity: 0.15,
          weight: 1.5,
          dashArray: '4, 4',
        }).addTo(map);
        userAccuracyCircleRef.current = circle;
      }
    }
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const startLat = stops[0]?.lat || 8.9954;
    const startLng = stops[0]?.lng || 38.7885;

    const map = L.map(mapContainerRef.current, {
      center: [startLat, startLng],
      zoom: 14,
      zoomControl: true,
      scrollWheelZoom: true,
      tapHold: true,
    });

    // High quality OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    // Draw route line
    const latLngs: [number, number][] = stops.map((s) => [s.lat, s.lng]);
    if (latLngs.length > 0) {
      const polyline = L.polyline(latLngs, {
        color: '#2563EB',
        weight: 5,
        opacity: 0.8,
        dashArray: '8, 8',
      }).addTo(map);
      routePolylineRef.current = polyline;

      // Fit route bounds initially
      try {
        map.fitBounds(polyline.getBounds(), { padding: [35, 35] });
      } catch (_e) {}
    }

    // Render Stop Markers
    stops.forEach((stop, idx) => {
      let iconHtml = '';
      if (stop.type === 'school') {
        iconHtml = `
          <div style="background-color: #10B981; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.5); border: 2px solid white; font-size: 15px;">
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
        <div style="position: absolute; inset: 0; border-radius: 50%; background-color: rgba(245, 158, 11, 0.35); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
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

    // Handle container resize & orientation changes
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      clearTimeout(timer);
      if (resizeObserver) resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
      userMarkerRef.current = null;
      userAccuracyCircleRef.current = null;
    };
  }, [stops, vehiclePlate, driverName]);

  // Request & acquire Real Device GPS Location automatically on mount
  const acquireRealGpsLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setGpsError('Geolocation is not supported by your browser or device.');
      return;
    }

    setGpsAcquiring(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy, speed: geoSpeed, heading: geoHeading } = pos.coords;
        const currentSpeed = geoSpeed !== null && geoSpeed >= 0 ? Math.round(geoSpeed * 3.6) : 0;
        const currentHeading = geoHeading !== null && geoHeading >= 0 ? Math.round(geoHeading) : 0;

        setRealGpsPosition({
          lat: latitude,
          lng: longitude,
          accuracy,
          speed: currentSpeed,
          heading: currentHeading,
          timestamp: pos.timestamp,
        });

        setCurrentPosition({ lat: latitude, lng: longitude });
        setSpeed(currentSpeed);
        setHeading(currentHeading);
        setLastUpdated(new Date(pos.timestamp).toLocaleTimeString());
        setGpsAcquiring(false);

        // Update User Real GPS Marker
        updateUserLocationMarker(latitude, longitude, accuracy);

        // If provider is active or user wants to track as transit vehicle:
        if (isProvider && busMarkerRef.current) {
          busMarkerRef.current.setLatLng([latitude, longitude]);
        }

        // Center smoothly on real location
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 15, {
            animate: true,
            duration: 1.2,
          });
        }
      },
      (err) => {
        setGpsAcquiring(false);
        // Note: do not display error in red if simply waiting or fallback stops are shown
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError('Real GPS location permission is required. Tap "Enable Real GPS" below to allow location access.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setGpsError('Real GPS position unavailable. Please check that device Location is switched on.');
        } else if (err.code === err.TIMEOUT) {
          setGpsError('Location request timed out. Tap "Retry Real GPS" to refresh.');
        } else {
          setGpsError(err.message || 'Unable to acquire real GPS location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  }, [isProvider, updateUserLocationMarker]);

  // Run initial real GPS acquisition on mount
  useEffect(() => {
    acquireRealGpsLocation();
  }, [acquireRealGpsLocation]);

  // Real Device GPS Continuous Watch (Broadcast for Drivers, or Live Tracking for Parents)
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
        const { latitude, longitude, accuracy, speed: geoSpeed, heading: geoHeading } = pos.coords;
        const currentSpeed = geoSpeed !== null && geoSpeed >= 0 ? Math.round(geoSpeed * 3.6) : 0;
        const currentHeading = geoHeading !== null && geoHeading >= 0 ? Math.round(geoHeading) : 0;

        setRealGpsPosition({
          lat: latitude,
          lng: longitude,
          accuracy,
          speed: currentSpeed,
          heading: currentHeading,
          timestamp: pos.timestamp,
        });

        setCurrentPosition({ lat: latitude, lng: longitude });
        setSpeed(currentSpeed);
        setHeading(currentHeading);
        setLastUpdated(new Date().toLocaleTimeString());

        // Update Real GPS marker
        updateUserLocationMarker(latitude, longitude, accuracy);

        // If provider/driver, also update bus marker position
        if (isProvider && busMarkerRef.current) {
          busMarkerRef.current.setLatLng([latitude, longitude]);
        }

        // 1. Broadcast over Socket.IO for immediate real-time parent tracking
        if (isProvider) {
          try {
            const socket = getSocket();
            const token = typeof window !== 'undefined' ? localStorage.getItem('schoolsafe_access_token') : undefined;
            socket.emit('driver_location', {
              tripId,
              latitude,
              longitude,
              speed: currentSpeed,
              heading: currentHeading,
              token,
              isSimulated: false,
            });
          } catch (_err) {}

          // 2. Persist to PostgreSQL database via REST
          try {
            await recordTripLocationApi(tripId, {
              latitude,
              longitude,
              speed: currentSpeed,
              heading: currentHeading,
            });
          } catch (_err) {}
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
        maximumAge: 2000,
        timeout: 15000,
      }
    );

    watchIdRef.current = watchId;
  };

  // Fetch initial location from PostgreSQL if recorded
  useEffect(() => {
    if (!tripId || tripId === 'active-trip' || tripId === 'demo-active-run') return;
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
        }
      })
      .catch(() => {});

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

      const token = typeof window !== 'undefined' ? localStorage.getItem('schoolsafe_access_token') : undefined;
      socket.emit('join_trip', { tripId, token });

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
    } catch (_err) {}
  }, [tripId]);

  // Smooth transit simulation generator for demonstrations
  const toggleSimulation = () => {
    if (isSimulating) {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = null;
      }
      setIsSimulating(false);
      return;
    }

    if (isDeviceGps) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsDeviceGps(false);
    }

    setIsSimulating(true);
    setGpsError(null);

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
        step = 0;
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

      try {
        const socket = getSocket();
        const token = typeof window !== 'undefined' ? localStorage.getItem('schoolsafe_access_token') : undefined;
        socket.emit('driver_location', {
          tripId,
          latitude: nextCoord.lat,
          longitude: nextCoord.lng,
          speed: simulatedSpeed,
          heading: simulatedHeading,
          token,
          isSimulated: true,
        });
      } catch (_err) {}

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

  const handleCenterRealLocation = () => {
    if (realGpsPosition && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([realGpsPosition.lat, realGpsPosition.lng], 16, {
        animate: true,
        duration: 1,
      });
    } else {
      acquireRealGpsLocation();
    }
  };

  const handleCenterBus = () => {
    if (mapInstanceRef.current && currentPosition) {
      mapInstanceRef.current.flyTo([currentPosition.lat, currentPosition.lng], 15, {
        animate: true,
        duration: 1,
      });
    }
  };

  const handleFitRoute = () => {
    if (mapInstanceRef.current && routePolylineRef.current) {
      mapInstanceRef.current.fitBounds(routePolylineRef.current.getBounds(), {
        padding: [30, 30],
        animate: true,
      });
    }
  };

  // Real distance to nearest stop or destination school
  const destinationStop = stops[stops.length - 1];
  const distanceToDestinationKm =
    realGpsPosition && destinationStop
      ? calculateDistanceKm(
          realGpsPosition.lat,
          realGpsPosition.lng,
          destinationStop.lat,
          destinationStop.lng
        )
      : null;

  return (
    <div
      className="panel-card live-map-wrapper"
      style={{
        padding: 0,
        overflow: 'hidden',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        backgroundColor: '#FFFFFF',
      }}
    >
      {/* Map Header / Live Status Bar (Fully Responsive) */}
      <div
        className="live-map-header"
        style={{
          padding: '0.85rem 1rem',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
            {realGpsPosition ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  backgroundColor: '#ECFDF5',
                  color: '#065F46',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '9999px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  border: '1px solid #A7F3D0',
                }}
              >
                <Satellite size={12} className="animate-pulse" style={{ color: '#059669' }} />
                Real GPS Active {realGpsPosition.accuracy ? `(±${Math.round(realGpsPosition.accuracy)}m)` : ''}
              </span>
            ) : isDeviceGps ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  backgroundColor: '#ECFDF5',
                  color: '#065F46',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '9999px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  border: '1px solid #A7F3D0',
                }}
              >
                <Satellite size={12} className="animate-pulse" style={{ color: '#059669' }} />
                Streaming Hardware GPS
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
                  fontSize: '0.72rem',
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
                  fontSize: '0.72rem',
                  fontWeight: 700,
                }}
              >
                <Radio size={12} style={{ color: '#10B981' }} />
                Live Telemetry Ready
              </span>
            )}

            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-primary)', margin: 0, wordBreak: 'break-word' }}>
              {routeName}
            </h3>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span>Vehicle: <strong>{vehiclePlate}</strong></span>
            <span>•</span>
            <span>Driver: <strong>{driverName}</strong></span>
            {distanceToDestinationKm !== null && (
              <>
                <span>•</span>
                <span style={{ color: '#0284C7', fontWeight: 600 }}>
                  📍 {distanceToDestinationKm < 1 ? `${Math.round(distanceToDestinationKm * 1000)}m away` : `${distanceToDestinationKm.toFixed(1)} km to school`}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Live Controls Bar (Responsive wrap) */}
        <div className="live-map-controls" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          {/* Universal Real GPS Locate Button */}
          <button
            onClick={handleCenterRealLocation}
            className={`btn btn-sm ${realGpsPosition ? 'btn-secondary' : 'btn-primary'}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.78rem',
              padding: '0.35rem 0.65rem',
            }}
            title="Center view on your device's real GPS coordinates"
            disabled={gpsAcquiring}
          >
            {gpsAcquiring ? (
              <>
                <RefreshCw size={13} className="spin-animation" /> Locating...
              </>
            ) : realGpsPosition ? (
              <>
                <LocateFixed size={13} style={{ color: '#2563EB' }} /> My Real GPS
              </>
            ) : (
              <>
                <LocateFixed size={13} /> Enable Real GPS
              </>
            )}
          </button>

          {/* Center Bus Button */}
          <button
            onClick={handleCenterBus}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
            title="Center map on school bus"
          >
            <Navigation size={13} /> Center Bus
          </button>

          {/* Fit Full Route Button */}
          <button
            onClick={handleFitRoute}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
            title="View full transit corridor"
          >
            <Crosshair size={13} /> Fit Route
          </button>

          {/* Continuous Hardware GPS Tracking (Broadcasting for Providers / Live Tracking for Parents) */}
          <button
            onClick={toggleDeviceGps}
            className={`btn btn-sm ${isDeviceGps ? 'btn-danger' : 'btn-secondary'}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.78rem',
              padding: '0.35rem 0.65rem',
              backgroundColor: isDeviceGps ? undefined : '#F0FDF4',
              borderColor: isDeviceGps ? undefined : '#86EFAC',
              color: isDeviceGps ? undefined : '#166534',
            }}
            title={isProvider ? 'Continuously broadcast real GPS coordinates to server' : 'Continuously watch real device location'}
          >
            {isDeviceGps ? (
              <>
                <Square size={13} /> Stop Tracking
              </>
            ) : (
              <>
                <Satellite size={13} /> {isProvider ? 'Broadcast GPS' : 'Live Tracking'}
              </>
            )}
          </button>

          {/* Simulation Toggle */}
          <button
            onClick={toggleSimulation}
            className={`btn btn-sm ${isSimulating ? 'btn-danger' : 'btn-ghost'}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', padding: '0.35rem 0.55rem' }}
            title="Simulate route movement"
          >
            {isSimulating ? (
              <>
                <Square size={13} /> Stop Demo
              </>
            ) : (
              <>
                <Play size={13} /> Simulate
              </>
            )}
          </button>
        </div>
      </div>

      {/* GPS Notice / Error Banner */}
      {gpsError && (
        <div
          style={{
            padding: '0.55rem 0.85rem',
            backgroundColor: '#FEF2F2',
            color: '#B91C1C',
            fontSize: '0.78rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            borderBottom: '1px solid #FCA5A5',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            <span>{gpsError}</span>
          </div>
          <button
            onClick={acquireRealGpsLocation}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem', height: 'auto' }}
          >
            Retry Real GPS
          </button>
        </div>
      )}

      {/* Map Canvas Container */}
      <div
        className="live-map-canvas-container"
        style={{
          position: 'relative',
          width: '100%',
          height: '400px',
          backgroundColor: '#E2E8F0',
        }}
      >
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

        {/* Floating Telemetry HUD Overlay (Responsive glass card) */}
        <div className="live-telemetry-hud">
          <div className="telemetry-hud-item">
            <Gauge size={15} style={{ color: '#0284C7', flexShrink: 0 }} />
            <div>
              <div className="telemetry-label">SPEED</div>
              <div className="telemetry-value">
                {tripStatus === 'COMPLETED' ? '0 km/h' : `${speed} km/h`}
              </div>
            </div>
          </div>

          <div className="telemetry-divider"></div>

          <div className="telemetry-hud-item">
            <Compass size={15} style={{ color: '#F59E0B', flexShrink: 0 }} />
            <div>
              <div className="telemetry-label">HEADING</div>
              <div className="telemetry-value">
                {heading > 0 ? `${heading}°` : 'NNE'}
              </div>
            </div>
          </div>

          <div className="telemetry-divider"></div>

          <div className="telemetry-hud-item">
            <MapPin size={15} style={{ color: '#2563EB', flexShrink: 0 }} />
            <div>
              <div className="telemetry-label">COORDINATES</div>
              <div className="telemetry-value" style={{ fontSize: '0.78rem' }}>
                {realGpsPosition
                  ? `${realGpsPosition.lat.toFixed(4)}, ${realGpsPosition.lng.toFixed(4)}`
                  : `${currentPosition.lat.toFixed(4)}, ${currentPosition.lng.toFixed(4)}`}
              </div>
            </div>
          </div>

          <div className="telemetry-divider"></div>

          <div className="telemetry-hud-item">
            <Clock size={15} style={{ color: '#10B981', flexShrink: 0 }} />
            <div>
              <div className="telemetry-label">TELEMETRY</div>
              <div className="telemetry-value" style={{ color: '#059669', fontSize: '0.78rem' }}>
                {lastUpdated}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stop Sequence Breakdown Footer (Fully Responsive Grid) */}
      <div
        style={{
          padding: '0.85rem 1rem',
          backgroundColor: '#F8FAFC',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)' }}>
            <Layers size={14} /> Scheduled Transit Stops Along Route
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
            {stops.length} designated safety checkpoints
          </span>
        </div>

        <div
          className="live-map-stops-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
            gap: '0.65rem',
          }}
        >
          {stops.map((stop, i) => (
            <div
              key={i}
              style={{
                padding: '0.55rem 0.75rem',
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
                minWidth: 0,
              }}
            >
              {stop.type === 'school' ? (
                <School size={16} style={{ color: '#10B981', flexShrink: 0 }} />
              ) : (
                <MapPin size={16} style={{ color: '#0284C7', flexShrink: 0 }} />
              )}
              <div style={{ minWidth: 0, overflow: 'hidden', flex: 1 }}>
                <div
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: 'var(--color-primary)',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}
                  title={stop.name}
                >
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
