import React, { useState, useEffect } from 'react'
import { Package, CheckCircle, Clock, AlertCircle, ShoppingCart, Search as SearchIcon, Eye } from 'lucide-react'
import { prescriptionsApi } from '../../api/pharmacyApi'
import { useAuth } from '../../context/AuthContext'

const statusConfig = {
  'Received': { color: 'var(--info)', bg: 'var(--info-light)', icon: Package, step: 1 },
  'Checking Medicines': { color: 'var(--accent)', bg: 'var(--accent-light)', icon: SearchIcon, step: 2 },
  'Preparing Order': { color: 'var(--warning)', bg: 'var(--warning-light)', icon: Clock, step: 3 },
  'Ready for Pickup': { color: 'var(--secondary)', bg: 'var(--secondary-light)', icon: CheckCircle, step: 4 },
  'Completed': { color: '#16a34a', bg: '#dcfce7', icon: CheckCircle, step: 5 },
}

const pipelineSteps = ['Received', 'Checking Medicines', 'Preparing Order', 'Ready for Pickup', 'Completed']

const OrderStatus = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await prescriptionsApi.getAll()
      setOrders(result.data)
      if (result.data.length === 0) {
        setError('No orders found. Upload a prescription to get started!')
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Track Your Orders</h2>
      <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
        View the status of your prescriptions and medicine orders.
      </p>

      {loading && (
        <div className="loading-overlay"><div className="spinner" /></div>
      )}

      {error && !loading && (
        <div className="alert alert-warning">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {orders && orders.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orders.map(order => {
            const config = statusConfig[order.status] || statusConfig['Received']
            const currentStepIndex = pipelineSteps.indexOf(order.status)

            return (
              <div key={order.id} className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Order #{order.id}</h3>
                    <p className="text-muted" style={{ fontSize: '0.8125rem' }}>
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className="badge" style={{ background: config.bg, color: config.color, fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}>
                    <config.icon size={16} style={{ marginRight: '0.25rem' }} />
                    {order.status}
                  </span>
                </div>

                {/* Items List */}
                {order.items && order.items.length > 0 && (
                  <div style={{ background: 'var(--primary-50)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.875rem', paddingBottom: '0.5rem', marginBottom: '0.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <ShoppingCart size={14} /> Ordered Items
                    </h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.875rem' }}>
                      {order.items.map((item, idx) => (
                        <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <span>{item.quantity}x {item.medicine_name}</span>
                          <span style={{ fontWeight: 600 }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border)', fontWeight: 700, fontSize: '0.9375rem' }}>
                      <span>Total:</span>
                      <span>₹{order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Status Pipeline */}
                <div className="status-pipeline">
                  {pipelineSteps.map((stepName, i) => {
                    const isCompleted = currentStepIndex > i
                    const isActive = currentStepIndex === i
                    return (
                      <div
                        key={stepName}
                        className={`status-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
                        style={{ flex: 1, justifyContent: 'center' }}
                      >
                        <div className="step-icon">
                          {isCompleted ? '✓' : i + 1}
                        </div>
                        <span style={{ fontSize: '0.7rem', textAlign: 'center' }}>{stepName}</span>
                      </div>
                    )
                  })}
                </div>

                {order.notes && (
                  <p className="text-muted" style={{ fontSize: '0.8125rem', marginTop: '1rem' }}>
                    <strong>Notes:</strong> {order.notes}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default OrderStatus
