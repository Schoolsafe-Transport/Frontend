import type { FC } from 'react';
import { useEffect, useState } from 'react';
import {
  MapPin,
  Bus,
  Search,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Navigation,
  Radio,
  X,
} from 'lucide-react';
import {
  getAdminRoutesApi,
  getAdminTripsApi,
  AdminRouteRecord,
  AdminTripRecord,
} from '../../services/api';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { LiveTrackingMap } from '../../components/dashboard/LiveTrackingMap';

export const AdminTripsRoutesPage: FC = () => {
  const [activeTab, setActiveTab] = useState<'ROUTES' | 'TRIPS'>('ROUTES');
  const [routes, setRoutes] = useState<AdminRouteRecord[]>([]);
  const [trips, setTrips] = useState<AdminTripRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [trackingModalTrip, setTrackingModalTrip] = useState<AdminTripRecord | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      if (activeTab === 'ROUTES') {
        const res = await getAdminRoutesApi({
          status: statusFilter === 'ALL' ? undefined : statusFilter,
          search: search.trim() || undefined,
        });
        setRoutes(res.routes || []);
      } else {
        const res = await getAdminTripsApi({
          status: statusFilter === 'ALL' ? undefined : statusFilter,
          search: search.trim() || undefined,
        });
        setTrips(res.trips || []);
      }
    } catch (err: any) {
      console.error('[AdminTripsRoutes] Error loading transit data:', err);
      setError(err?.response?.data?.message || 'Failed to load transit data from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <div>
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">
              {activeTab === 'ROUTES' ? <MapPin size={20} style={{ color: '#2563EB' }} /> : <Bus size={20} style={{ color: '#2563EB' }} />}
              Platform Transit Routes & Live Dispatches
            </h2>
            <p className="admin-card-desc">
              Real-time monitoring of school transit corridors, vehicle assignments, and trip execution
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
                placeholder={activeTab === 'ROUTES' ? 'Search route name, school...' : 'Search trip, vehicle, driver...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="admin-btn admin-btn-secondary admin-btn-sm">
              Search
            </button>
          </form>
        </div>

        {/* View Switcher and Filter Strip */}
        <div className="admin-filter-bar">
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* View Switcher */}
            <div className="admin-tabs-group">
              <button
                className={`admin-tab-btn ${activeTab === 'ROUTES' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('ROUTES');
                  setStatusFilter('ALL');
                }}
              >
                Routes ({routes.length})
              </button>
              <button
                className={`admin-tab-btn ${activeTab === 'TRIPS' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('TRIPS');
                  setStatusFilter('ALL');
                }}
              >
                Trips & Dispatches ({trips.length})
              </button>
            </div>

            {/* Status Filter */}
            <div className="admin-tabs-group">
              <button
                className={`admin-tab-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setStatusFilter('ALL')}
              >
                All Statuses
              </button>
              {activeTab === 'ROUTES' ? (
                <>
                  <button
                    className={`admin-tab-btn ${statusFilter === 'ACTIVE' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('ACTIVE')}
                  >
                    Active
                  </button>
                  <button
                    className={`admin-tab-btn ${statusFilter === 'INACTIVE' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('INACTIVE')}
                  >
                    Inactive
                  </button>
                </>
              ) : (
                <>
                  <button
                    className={`admin-tab-btn ${statusFilter === 'IN_PROGRESS' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('IN_PROGRESS')}
                  >
                    In Progress
                  </button>
                  <button
                    className={`admin-tab-btn ${statusFilter === 'SCHEDULED' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('SCHEDULED')}
                  >
                    Scheduled
                  </button>
                  <button
                    className={`admin-tab-btn ${statusFilter === 'COMPLETED' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('COMPLETED')}
                  >
                    Completed
                  </button>
                </>
              )}
            </div>
          </div>

          <button
            className="admin-btn admin-btn-secondary admin-btn-sm"
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Content Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
            <Loader2 size={32} className="animate-spin" style={{ color: '#2563EB', margin: '0 auto 0.5rem' }} />
            <p style={{ color: '#64748B', fontSize: '0.875rem' }}>Retrieving transit records from database...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#DC2626' }}>
            <AlertTriangle size={32} style={{ margin: '0 auto 0.5rem' }} />
            <p>{error}</p>
            <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={fetchData} style={{ marginTop: '0.5rem' }}>
              Retry
            </button>
          </div>
        ) : activeTab === 'ROUTES' ? (
          routes.length === 0 ? (
            <div className="admin-empty-state">
              <div className="admin-empty-icon">
                <MapPin size={26} />
              </div>
              <h4>No Routes Found</h4>
              <p style={{ fontSize: '0.85rem' }}>No routes matching your criteria in the database.</p>
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Route Details</th>
                    <th>Destination School</th>
                    <th>Assigned Vehicle</th>
                    <th>Seats & Price</th>
                    <th>Stops</th>
                    <th>Active Bookings</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {routes.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <strong style={{ color: '#0F172A', display: 'block', fontSize: '0.9rem' }}>
                          {r.name}
                        </strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                          Origin: {r.origin}
                        </span>
                        {r.provider && (
                          <span style={{ display: 'block', fontSize: '0.75rem', color: '#2563EB', fontWeight: 600 }}>
                            {r.provider.businessName || `${r.provider.firstName} ${r.provider.lastName}`}
                          </span>
                        )}
                      </td>
                      <td>
                        <strong style={{ color: '#1E40AF', fontSize: '0.875rem' }}>
                          {r.destinationSchool}
                        </strong>
                        {r.schoolBranch && (
                          <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748B' }}>
                            {r.schoolBranch}
                          </span>
                        )}
                      </td>
                      <td>
                        {r.vehicle ? (
                          <div>
                            <span style={{ fontWeight: 700, color: '#0F172A', display: 'block' }}>
                              {r.vehicle.plateNumber}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                              {r.vehicle.make} {r.vehicle.model} ({r.vehicle.capacity} cap)
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>Unassigned</span>
                        )}
                      </td>
                      <td>
                        <strong style={{ color: '#059669', display: 'block' }}>
                          ETB {r.monthlyPrice.toLocaleString()}/mo
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                          {r.availableSeats} of {r.capacity} seats left
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>
                          {r.stops?.length || 0} stop(s)
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#2563EB', fontSize: '0.9rem' }}>
                          {r._count?.agreements || 0} students
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : trips.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">
              <Bus size={26} />
            </div>
            <h4>No Trips Found</h4>
            <p style={{ fontSize: '0.85rem' }}>No trips matching your filter in the database.</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Transit Route</th>
                  <th>Vehicle & Plate</th>
                  <th>Driver</th>
                  <th>Passengers</th>
                  <th>Latest GPS Timestamp</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Live Telemetry</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <strong style={{ color: '#0F172A', display: 'block' }}>
                        {t.route?.name || 'School Transit Route'}
                      </strong>
                      <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                        {t.route?.destinationSchool ? `To: ${t.route.destinationSchool}` : 'Active Dispatch'}
                      </span>
                    </td>
                    <td>
                      <strong>{t.vehicle?.plateNumber || 'Fleet Vehicle'}</strong>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748B' }}>
                        {t.vehicle?.make} {t.vehicle?.model}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: '#334155' }}>
                        {t.driver ? `${t.driver.firstName} ${t.driver.lastName}` : 'Unassigned'}
                      </strong>
                      {t.driver?.phone && (
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748B' }}>
                          {t.driver.phone}
                        </span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#2563EB' }}>
                        {t.passengers?.length || 0} students
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#64748B' }}>
                      {t.locations?.[0] ? (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#059669', fontWeight: 600 }}>
                            <Navigation size={12} /> Live Pings
                          </div>
                          <span>{new Date(t.locations[0].timestamp).toLocaleTimeString()}</span>
                        </div>
                      ) : (
                        <span>Created {new Date(t.createdAt).toLocaleTimeString()}</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={t.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem' }}
                        onClick={() => setTrackingModalTrip(t)}
                      >
                        <Radio size={13} style={{ color: '#059669' }} /> Live Map
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Admin Live Tracking Modal */}
      {trackingModalTrip && (
        <div className="admin-modal-backdrop" onClick={() => setTrackingModalTrip(null)}>
          <div
            className="admin-modal"
            style={{ maxWidth: '850px', width: '95%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bus size={20} style={{ color: '#2563EB' }} />
                <h3 className="admin-modal-title" style={{ margin: 0 }}>
                  Transit GPS Monitor: {trackingModalTrip.route?.name || 'Active Dispatch'}
                </h3>
              </div>
              <button
                type="button"
                className="admin-btn admin-btn-secondary admin-btn-sm"
                onClick={() => setTrackingModalTrip(null)}
                style={{ padding: '0.3rem 0.5rem' }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="admin-modal-body" style={{ padding: '1rem' }}>
              <LiveTrackingMap
                tripId={trackingModalTrip.id}
                tripStatus={trackingModalTrip.status}
                routeName={trackingModalTrip.route?.name || 'School Transit Run'}
                driverName={
                  trackingModalTrip.driver
                    ? `${trackingModalTrip.driver.firstName} ${trackingModalTrip.driver.lastName}`
                    : 'Assigned Driver'
                }
                vehiclePlate={
                  trackingModalTrip.vehicle
                    ? `${trackingModalTrip.vehicle.make} ${trackingModalTrip.vehicle.model} • ${trackingModalTrip.vehicle.plateNumber}`
                    : 'Fleet Vehicle'
                }
                isProvider={false}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
