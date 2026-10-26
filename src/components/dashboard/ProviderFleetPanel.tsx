import { useState, useEffect, FC } from 'react';
import {
  Car,
  Plus,
  CheckCircle2,
  Trash2,
  X,
  ShieldAlert,
  FileCheck,
} from 'lucide-react';
import {
  getVehiclesApi,
  createVehicleApi,
  deleteVehicleApi,
} from '../../services/api';

export const ProviderFleetPanel: FC<{
  user: any;
  onNavigateTab?: (tab: 'Verification' | 'Routes') => void;
}> = ({ onNavigateTab }) => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form State
  const [make, setMake] = useState('Toyota');
  const [model, setModel] = useState('HiAce Minibus');
  const [year, setYear] = useState<number>(2022);
  const [plateNumber, setPlateNumber] = useState('');
  const [capacity, setCapacity] = useState<number>(18);
  const [photoUrl, setPhotoUrl] = useState('');

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await getVehiclesApi();
      setVehicles(data || []);
    } catch (_err) {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setSubmitting(true);
      await createVehicleApi({
        make,
        model,
        year: Number(year),
        plateNumber: plateNumber.trim(),
        capacity: Number(capacity),
        photoUrl: photoUrl.trim() || undefined,
      });

      setSuccess('Vehicle registered successfully! It is now pending safety inspection verification.');
      setShowAddModal(false);
      // Reset form
      setPlateNumber('');
      setCapacity(18);
      fetchVehicles();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to register vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVehicle = async (id: string, plate: string) => {
    if (!window.confirm(`Are you sure you want to remove vehicle ${plate}?`)) return;
    try {
      setError(null);
      await deleteVehicleApi(id);
      setSuccess(`Vehicle ${plate} removed successfully.`);
      fetchVehicles();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Cannot remove vehicle with active routes');
    }
  };

  return (
    <div className="panel-card">
      <div className="panel-header">
        <div>
          <h3 className="panel-title">Vehicle Fleet Management</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
            Manage registered commercial vehicles, seating capacities, and transport safety compliance
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {onNavigateTab && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigateTab('Verification')}
              title="Upload vehicle registration (libre), inspection, and insurance documents"
            >
              <FileCheck size={15} /> Upload Inspection Docs
            </button>
          )}
          <button
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            onClick={() => {
              setError(null);
              setShowAddModal(true);
            }}
          >
            <Plus size={16} /> Register New Vehicle
          </button>
        </div>
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
          Loading vehicle fleet...
        </div>
      ) : vehicles.length === 0 ? (
        <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
          <Car size={40} style={{ color: 'var(--color-border)', margin: '0 auto 1rem', display: 'block' }} />
          <h4 style={{ color: 'var(--color-primary)', marginBottom: '0.35rem' }}>No vehicles registered yet</h4>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', maxWidth: '420px', margin: '0 auto 1.25rem' }}>
            Register your first vehicle (e.g., Toyota HiAce or Coaster bus) to begin creating routes and receiving student transportation requests.
          </p>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
            <Plus size={15} /> Add Vehicle Now
          </button>
        </div>
      ) : (
        <div className="grid-2">
          {vehicles.map((v) => (
            <div
              key={v.id}
              style={{
                padding: '1.25rem',
                border: '1px solid var(--color-border)',
                borderRadius: '10px',
                backgroundColor: '#FFFFFF',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <h4 style={{ color: 'var(--color-primary)', margin: 0, fontSize: '1.05rem' }}>
                      {v.make} {v.model}
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      Year: {v.year || 'N/A'} • Plate: <strong style={{ color: 'var(--color-primary)' }}>{v.plateNumber}</strong>
                    </span>
                  </div>

                  {v.isVerified ? (
                    <span className="badge-status active" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <CheckCircle2 size={12} /> Verified & Approved
                    </span>
                  ) : (
                    <span className="badge-status pending" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <ShieldAlert size={12} /> Pending Review
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Passenger Capacity:</span>
                    <span style={{ fontWeight: 600 }}>{v.capacity} Seats</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Assigned Routes:</span>
                    <span style={{ fontWeight: 600 }}>{v.routes?.length || 0} active routes</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Operating Status:</span>
                    <span style={{ fontWeight: 600, color: v.status === 'ACTIVE' ? 'var(--color-success)' : 'var(--color-warning)' }}>
                      {v.status}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
                <button
                  onClick={() => handleDeleteVehicle(v.id, v.plateNumber)}
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--color-danger)', gap: '0.35rem' }}
                  title="Remove Vehicle"
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Register Vehicle Modal */}
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
              maxWidth: '520px',
              width: '100%',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, color: 'var(--color-primary)' }}>Register New Commercial Vehicle</h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateVehicle}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Make *
                  </label>
                  <input
                    type="text"
                    required
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    placeholder="Toyota, Isuzu..."
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Model *
                  </label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="HiAce, Coaster..."
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Plate Number * (e.g. 3-A2849)
                  </label>
                  <input
                    type="text"
                    required
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                    placeholder="3-A2849"
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)', textTransform: 'uppercase' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Year
                  </label>
                  <input
                    type="number"
                    min={1995}
                    max={2030}
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Passenger Seating Capacity * (Seats)
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  required
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Vehicle Photo URL (Optional)
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                />
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
                  disabled={submitting}
                >
                  {submitting ? 'Registering...' : 'Register Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
