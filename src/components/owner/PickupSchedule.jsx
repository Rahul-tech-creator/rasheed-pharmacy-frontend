import React, { useEffect, useState } from 'react'
import { Calendar, Clock, User, Phone, Trash2, Package } from 'lucide-react'
import { usePharmacy } from '../../context/PharmacyContext'
import { slotsApi } from '../../api/pharmacyApi'

const formatTime = (time) => {
  const [h, m] = time.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const h12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${h12}:${m} ${ampm}`
}

const PickupSchedule = () => {
  const { slots, fetchSlots } = usePharmacy()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState(null)

  const today = new Date()
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    return d.toISOString().split('T')[0]
  })

  useEffect(() => {
    setLoading(true)
    fetchSlots({ date: selectedDate })
      .finally(() => setLoading(false))
  }, [selectedDate, fetchSlots])

  const handleCancel = async (id) => {
    if (!confirm('Cancel this pickup slot?')) return
    try {
      await slotsApi.cancel(id)
      await fetchSlots({ date: selectedDate })
      setFeedback({ msg: 'Slot cancelled', type: 'success' })
      setTimeout(() => setFeedback(null), 3000)
    } catch (err) {
      setFeedback({ msg: err.message, type: 'error' })
      setTimeout(() => setFeedback(null), 3000)
    }
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00')
    const isToday = dateStr === dates[0]
    const isTomorrow = dateStr === dates[1]
    if (isToday) return 'Today'
    if (isTomorrow) return 'Tomorrow'
    return d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  return (
    <div className="animate-fade-in">
      <div className="dashboard-header">
        <h1>Pickup Schedule</h1>
        <p className="text-muted">View and manage customer pickup appointments</p>
      </div>

      {feedback && (
        <div className={`alert ${feedback.type === 'error' ? 'alert-error' : 'alert-success'}`}>
          {feedback.msg}
        </div>
      )}

      {/* Date Selector */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {dates.map(date => (
          <button
            key={date}
            className={`btn btn-sm ${selectedDate === date ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSelectedDate(date)}
          >
            <Calendar size={14} />
            {formatDate(date)}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: '0.5rem' }}>
        <div style={{ padding: '1rem 1rem 0.5rem' }}>
          <h3 style={{ fontSize: '1rem' }}>
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
              weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
            })}
            <span className="badge badge-info" style={{ marginLeft: '0.75rem' }}>
              {slots.length} pickup{slots.length !== 1 ? 's' : ''}
            </span>
          </h3>
        </div>

        {loading ? (
          <div className="loading-overlay"><div className="spinner" /></div>
        ) : slots.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem' }}>
            <Clock size={48} className="empty-icon" />
            <h3>No pickups scheduled</h3>
            <p>No customers have booked pickup slots for this date.</p>
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Order</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {slots.map(slot => (
                  <tr key={slot.id}>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--primary-dark)' }}>
                        <Clock size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.25rem' }} />
                        {formatTime(slot.pickup_time)}
                      </span>
                    </td>
                    <td><strong>{slot.customer_name}</strong></td>
                    <td>{slot.customer_phone}</td>
                    <td>
                      {slot.prescription_id ? (
                        <div>
                          <span className={`badge ${
                            slot.prescription_status === 'Ready' ? 'badge-success' :
                            slot.prescription_status === 'Completed' ? 'badge-neutral' :
                            slot.prescription_status === 'Awaiting Stock' ? 'badge-warning' :
                            'badge-info'
                          }`}>
                            #{slot.prescription_id} — {slot.prescription_status || 'Linked'}
                          </span>
                          {slot.items && slot.items.length > 0 && (
                            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-light)', background: 'var(--bg-main)', padding: '0.375rem', borderRadius: 'var(--radius-sm)' }}>
                              <div style={{ fontWeight: 600, marginBottom: '0.125rem', color: 'var(--text-main)' }}>Items:</div>
                              {slot.items.map((item, idx) => (
                                <div key={idx}>{item.quantity}x {item.medicine_name}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="badge badge-neutral">Walk-in</span>
                      )}
                    </td>
                    <td className="text-muted" style={{ fontSize: '0.8125rem', maxWidth: '200px' }}>
                      {slot.notes || '—'}
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm btn-icon"
                        onClick={() => handleCancel(slot.id)}
                        title="Cancel slot"
                        style={{ color: 'var(--danger)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default PickupSchedule
