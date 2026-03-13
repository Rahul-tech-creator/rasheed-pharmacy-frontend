import React, { useEffect, useState } from 'react'
import { Eye, CheckCircle, Clock, Package, AlertCircle, FileText, ShoppingCart, ListChecks, Search } from 'lucide-react'
import { usePharmacy } from '../../context/PharmacyContext'
import { UPLOAD_BASE } from '../../api/pharmacyApi'

const statusConfig = {
  'Received': { color: 'var(--info)', bg: 'var(--info-light)' },
  'Checking Medicines': { color: 'var(--accent)', bg: 'var(--accent-light)' },
  'Preparing Order': { color: 'var(--warning)', bg: 'var(--warning-light)' },
  'Ready for Pickup': { color: 'var(--secondary)', bg: 'var(--secondary-light)' },
  'Completed': { color: '#16a34a', bg: '#dcfce7' },
}

const PrescriptionManager = () => {
  const { prescriptions, fetchPrescriptions, updatePrescriptionStatus, loading } = usePharmacy()
  const [statusFilter, setStatusFilter] = useState('')
  const [viewImage, setViewImage] = useState(null)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    fetchPrescriptions({ status: statusFilter || undefined })
  }, [statusFilter, fetchPrescriptions])

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updatePrescriptionStatus(id, newStatus)
      setFeedback({ msg: `Order #${id} marked as "${newStatus}"`, type: 'success' })
      setTimeout(() => setFeedback(null), 3000)
    } catch (err) {
      setFeedback({ msg: err.message, type: 'error' })
      setTimeout(() => setFeedback(null), 3000)
    }
  }

  const getNextActions = (status) => {
    switch (status) {
      case 'Received': return ['Checking Medicines'];
      case 'Checking Medicines': return ['Preparing Order'];
      case 'Preparing Order': return ['Ready for Pickup'];
      case 'Ready for Pickup': return ['Completed'];
      case 'Completed': return [];
      default: return [];
    }
  }

  const getActionStyle = (action) => {
    switch (action) {
      case 'Checking Medicines': return 'btn-primary';
      case 'Preparing Order': return 'btn-warning';
      case 'Ready for Pickup': return 'btn-secondary';
      case 'Completed': return 'btn-success';
      default: return 'btn-primary';
    }
  }

  const getActionIcon = (action) => {
    switch (action) {
      case 'Checking Medicines': return <Search size={14} />;
      case 'Preparing Order': return <Clock size={14} />;
      case 'Ready for Pickup': return <ListChecks size={14} />;
      case 'Completed': return <CheckCircle size={14} />;
      default: return null;
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="dashboard-header">
        <h1>Order & Prescription Management</h1>
        <p className="text-muted">Review uploaded prescriptions, manage medicine orders, and update preparation statuses</p>
      </div>

      {feedback && (
        <div className={`alert ${feedback.type === 'error' ? 'alert-error' : 'alert-success'}`}>
          {feedback.msg}
        </div>
      )}

      {/* Status Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { value: '', label: 'All' },
          { value: 'Received', label: 'Received' },
          { value: 'Checking Medicines', label: 'Checking' },
          { value: 'Preparing Order', label: 'Preparing' },
          { value: 'Ready for Pickup', label: 'Ready' },
          { value: 'Completed', label: 'Completed' },
        ].map(filter => (
          <button
            key={filter.value}
            className={`btn btn-sm ${statusFilter === filter.value ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setStatusFilter(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {loading.prescriptions ? (
        <div className="loading-overlay"><div className="spinner" /></div>
      ) : prescriptions.length === 0 ? (
        <div className="empty-state">
          <Package size={48} className="empty-icon" />
          <h3>No Orders Found</h3>
          <p>{statusFilter ? `No orders currently marked as "${statusFilter}".` : 'No orders or prescriptions received yet.'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {prescriptions.map(rx => {
            const config = statusConfig[rx.status] || statusConfig['Received']
            const nextActions = getNextActions(rx.status)

            return (
              <div key={rx.id} className="card" style={{ padding: '1.25rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}>
                  <div style={{ flex: 1, minWidth: '250px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1rem' }}>Order #{rx.id} — {rx.customer_name}</h3>
                      <span className="badge" style={{ background: config.bg, color: config.color }}>
                        {rx.status}
                      </span>
                    </div>
                    <p className="text-muted" style={{ fontSize: '0.8125rem', marginBottom: '0.375rem', display: 'flex', gap: '1rem' }}>
                      <span>📞 {rx.customer_phone}</span>
                      <span>📅 {new Date(rx.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}</span>
                    </p>
                    {rx.notes && (
                      <p className="text-muted" style={{ fontSize: '0.8125rem' }}>💬 {rx.notes}</p>
                    )}

                    {/* Show ordered items if exist */}
                    {rx.items && rx.items.length > 0 && (
                      <div style={{ background: 'var(--primary-50)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginTop: '0.75rem', fontSize: '0.8125rem' }}>
                        <div style={{ fontWeight: 600, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <ShoppingCart size={14} /> Medicine Order
                        </div>
                        {rx.items.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>{item.quantity}x {item.medicine_name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                    {rx.file_path && (
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => setViewImage(`${UPLOAD_BASE}/${rx.file_path}`)}
                        style={{ width: '100%', justifyContent: 'center' }}
                      >
                        <Eye size={14} /> View Prescription
                      </button>
                    )}
                    
                    {nextActions.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                        {nextActions.map(action => (
                          <button
                            key={action}
                            className={`btn btn-sm ${getActionStyle(action)}`}
                            onClick={() => handleStatusUpdate(rx.id, action)}
                          >
                            {getActionIcon(action)}
                            Mark {action}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Image Viewer Modal */}
      {viewImage && (
        <div className="modal-overlay" onClick={() => setViewImage(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h2>Prescription Image</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setViewImage(null)}>
                ✕
              </button>
            </div>
            <img
              src={viewImage}
              alt="Prescription"
              style={{ width: '100%', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
            <div className="empty-state" style={{ display: 'none' }}>
              <FileText size={48} className="empty-icon" />
              <p>Unable to preview this file. It may be a PDF.</p>
              <a href={viewImage} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-md">
                Download File
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PrescriptionManager
