import { useState, useEffect, FC } from 'react';
import {
  MapPin,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import {
  getProviderRoutesApi,
  getVehiclesApi,
  createRouteApi,
  deleteRouteApi,
} from '../../services/api';

export const ProviderRoutesPanel: FC<{ user: any }> = ({ user }) => {
  const [routes, setRoutes] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form State
  const [vehicleId, setVehicleId] = useState('');
  const [name, setName] = useState('');
  const [origin, setOrigin] = useState('');
  const [destinationSchool, setDestinationSchool] = useState('');
  const [departureTimeMorning, setDepartureTimeMorning] = useState('07:00 AM');
  const [departureTimeAfternoon, setDepartureTimeAfternoon] = useState('15:30 PM');
  const [serviceType, setServiceType] = useState<'BOTH' | 'MORNING' | 'AFTERNOON'>('BOTH');
  const [monthlyPrice, setMonthlyPrice] = useState<number | ''>(2500);
  const [stops, setStops] = useState<Array<{ name: string; pickupTimeMorning?: string; dropoffTimeAfternoon?: string }>>([
    { name: '', pickupTimeMorning: '07:10 AM', dropoffTimeAfternoon: '15:45 PM' },
  ]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [routesData, vehiclesData] = await Promise.all([
        getProviderRoutesApi(),
        getVehiclesApi(),
      ]);
      setRoutes(routesData || []);
      setVehicles(vehiclesData || []);
      if (vehiclesData && vehiclesData.length > 0 && !vehicleId) {
        setVehicleId(vehiclesData[0].id);
      }
    } catch (_err) {
      // Catch
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddStop = () => {
    setStops([...stops, { name: '', pickupTimeMorning: '07:20 AM', dropoffTimeAfternoon: '16:00 PM' }]);
  };

  const handleRemoveStop = (idx: number) => {
    setStops(stops.filter((_, i) => i !== idx));
  };

  const handleStopChange = (idx: number, field: string, value: string) => {
    const updated = [...stops];
    updated[idx] = { ...updated[idx], [field]: value };
    setStops(updated);
  };

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId) {
      setError('Please select or register a vehicle first.');
      return;
    }

    try {
      setError(null);
      setSubmitting(true);
      const validStops = stops
        .filter((s) => s.name.trim() !== '')
        .map((s, idx) => ({ ...s, orderIndex: idx }));

      await createRouteApi({
        vehicleId,
        name: name.trim(),
        origin: origin.trim(),
        destinationSchool: destinationSchool.trim(),
        departureTimeMorning,
        departureTimeAfternoon,
        serviceType,
        monthlyPrice: Number(monthlyPrice),
        stops: validStops.length > 0 ? validStops : undefined,
      });

      setSuccess('Transportation route published successfully!');
      setShowAddModal(false);
      // Reset form
      setName('');
      setOrigin('');
      setDestinationSchool('');
      setStops([{ name: '', pickupTimeMorning: '07:10 AM', dropoffTimeAfternoon: '15:45 PM' }]);
      loadData();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create route');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRoute = async (id: string, routeName: string) => {
    if (!window.confirm(`Are you sure you want to delete or deactivate route "${routeName}"?`)) return;
    try {
      setError(null);
      await deleteRouteApi(id);
      setSuccess(`Route "${routeName}" deactivated/deleted successfully.`);
      loadData();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove route');
    }
  };

  return (
    <div className="panel-card">
      {user?.status !== 'ACTIVE' && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: '#FEF3C7',
            border: '1px solid #FCD34D',
            borderRadius: '8px',
            color: '#92400E',
            marginBottom: '1.25rem',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span>
            <strong>Account Pending Administrator Approval:</strong> Your Transport Provider account has not been approved yet. Route creation and publishing will be unlocked once an administrator reviews and approves your documents and credentials.
          </span>
        </div>
      )}

      <div className="panel-header">
        <div>
          <h3 className="panel-title">Defined School Transportation Routes</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
            Published transit lines available for parents to discover and request seats
          </p>
        </div>
        <button
          className="btn btn-primary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          disabled={user?.status !== 'ACTIVE'}
          title={user?.status !== 'ACTIVE' ? 'Account approval required to create routes' : undefined}
          onClick={() => {
            if (user?.status !== 'ACTIVE') return;
            setError(null);
            setShowAddModal(true);
          }}
        >
          <Plus size={16} /> Create New Route
        </button>
      </div>

      {success && (
        <div style={{ padding: '0.85rem 1rem', marginBottom: '1.25rem', backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600 }}>
          {success}
        </div>
      )}

      {error && (
        <div style={{ padding: '0.85rem 1rem', marginBottom: '1.25rem', backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger)', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          Loading routes...
        </div>
      ) : routes.length === 0 ? (
        <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
          <MapPin size={40} style={{ color: 'var(--color-border)', margin: '0 auto 1rem', display: 'block' }} />
          <h4 style={{ color: 'var(--color-primary)', marginBottom: '0.35rem' }}>No routes configured</h4>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', maxWidth: '420px', margin: '0 auto 1.25rem' }}>
            Define school transit routes by linking a registered vehicle, your target school, and pickup stops.
          </p>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
            <Plus size={15} /> Create Route Now
          </button>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Route Name</th>
              <th>Destination School</th>
              <th>Assigned Vehicle</th>
              <th>Service Timing</th>
              <th>Seats (Available / Total)</th>
              <th>Monthly Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((r) => (
              <tr key={r.id}>
                <td>
                  <strong>{r.name}</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    Origin: {r.origin}
                  </div>
                </td>
                <td>{r.destinationSchool}</td>
                <td>
                  {r.vehicle?.make} {r.vehicle?.model}
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    Plate: {r.vehicle?.plateNumber}
                  </div>
                </td>
                <td>
                  <div style={{ fontSize: '0.85rem' }}>
                    Morning: {r.departureTimeMorning || '07:00 AM'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                    Afternoon: {r.departureTimeAfternoon || '15:30 PM'}
                  </div>
                </td>
                <td>
                  <strong style={{ color: r.availableSeats > 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    {r.availableSeats}
                  </strong>{' '}
                  / {r.capacity} Seats
                </td>
                <td>
                  <strong>ETB {r.monthlyPrice.toLocaleString()}</strong> / mo
                </td>
                <td>
                  <span className={`badge-status ${r.status === 'ACTIVE' ? 'active' : 'pending'}`}>
                    {r.status}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => handleDeleteRoute(r.id, r.name)}
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--color-danger)', padding: '0.25rem 0.5rem' }}
                    title="Remove Route"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Create Route Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '1.75rem',
              maxWidth: '650px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, color: 'var(--color-primary)' }}>Create New Transportation Route</h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateRoute}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Assigned Fleet Vehicle *
                </label>
                {vehicles.length === 0 ? (
                  <div style={{ padding: '0.75rem', backgroundColor: '#FEF2F2', color: 'var(--color-danger)', borderRadius: '6px', fontSize: '0.85rem' }}>
                    You have no registered vehicles. Please register a vehicle in the Fleet tab before creating a route.
                  </div>
                ) : (
                  <select
                    required
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                  >
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.make} {v.model} ({v.plateNumber}) • {v.capacity} Seats
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Route Name * (e.g. Route #04 Bole ➔ Cambridge)
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Route #04: Bole to Cambridge Academy"
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Origin Area * (e.g. Bole Medhanealem)
                  </label>
                  <input
                    type="text"
                    required
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="Bole, Kazanchis, CMC..."
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Destination School *
                  </label>
                  <input
                    type="text"
                    required
                    value={destinationSchool}
                    onChange={(e) => setDestinationSchool(e.target.value)}
                    placeholder="Cambridge Academy, Sandford..."
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Monthly Price (ETB) *
                  </label>
                  <input
                    type="number"
                    min={100}
                    required
                    value={monthlyPrice}
                    onChange={(e) => setMonthlyPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="2500"
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Transit Service Type *
                </label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value as any)}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                >
                  <option value="BOTH">Two-way (Morning Pickup & Afternoon Return)</option>
                  <option value="MORNING">Morning Only (School Inbound)</option>
                  <option value="AFTERNOON">Afternoon Only (Home Return)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Morning Departure Time
                  </label>
                  <input
                    type="text"
                    value={departureTimeMorning}
                    onChange={(e) => setDepartureTimeMorning(e.target.value)}
                    placeholder="07:00 AM"
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Afternoon Return Time
                  </label>
                  <input
                    type="text"
                    value={departureTimeAfternoon}
                    onChange={(e) => setDepartureTimeAfternoon(e.target.value)}
                    placeholder="15:30 PM"
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                  />
                </div>
              </div>

              {/* Pickup Stops */}
              <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-primary)' }}>
                    Intermediate Pickup & Drop-off Stops
                  </span>
                  <button
                    type="button"
                    onClick={handleAddStop}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.775rem', padding: '0.25rem 0.5rem' }}
                  >
                    + Add Stop
                  </button>
                </div>

                {stops.map((stop, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder={`Stop #${idx + 1} Name (e.g. Atlas Junction)`}
                      value={stop.name}
                      onChange={(e) => handleStopChange(idx, 'name', e.target.value)}
                      style={{ flex: 2, padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}
                    />
                    <input
                      type="text"
                      placeholder="Morning (07:15 AM)"
                      value={stop.pickupTimeMorning || ''}
                      onChange={(e) => handleStopChange(idx, 'pickupTimeMorning', e.target.value)}
                      style={{ flex: 1, padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}
                    />
                    {stops.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveStop(idx)}
                        style={{ border: 'none', background: 'none', color: 'var(--color-danger)', cursor: 'pointer' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={submitting || vehicles.length === 0}
                >
                  {submitting ? 'Creating...' : 'Publish Route'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
