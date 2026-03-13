import React, { useState, useEffect } from 'react'
import { Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { usePharmacy } from '../../context/PharmacyContext'
import { useAuth } from '../../context/AuthContext'

const timeSlots = []
for (let h = 9; h <= 21; h++) {
  for (let m = 0; m < 60; m += 30) {
    if (h === 21 && m > 0) break
    const hour = h.toString().padStart(2, '0')
    const min = m.toString().padStart(2, '0')
    timeSlots.push(`${hour}:${min}`)
  }
}

const formatTime = (time) => {
  const [h, m] = time.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const h12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${h12}:${m} ${ampm}`
}

const SlotBooking = () => {
  const { bookSlot, fetchBookedSlots, loading } = usePharmacy()
  const { user } = useAuth()
  const [form, setForm] = useState({
    customer_name: user?.name || '',
    customer_phone: user?.phone || '',
    notes: ''
  })
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [bookedTimes, setBookedTimes] = useState([])
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)
  const [loadingSlots, setLoadingSlots] = useState(false)

  // Get today and next 7 days
  const today = new Date()
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    return d.toISOString().split('T')[0]
  })

  useEffect(() => {
    if (selectedDate) {
      setLoadingSlots(true)
      setSelectedTime('')
      fetchBookedSlots(selectedDate)
        .then(booked => setBookedTimes(booked))
        .catch(() => setBookedTimes([]))
        .finally(() => setLoadingSlots(false))
    }
  }, [selectedDate, fetchBookedSlots])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!form.customer_name.trim() || !form.customer_phone.trim()) {
      setError('Please fill in your name and phone number')
      return
    }
    if (!selectedDate || !selectedTime) {
      setError('Please select a date and time slot')
      return
    }

    try {
      const result = await bookSlot({
        customer_name: form.customer_name.trim(),
        customer_phone: form.customer_phone.trim(),
        pickup_date: selectedDate,
        pickup_time: selectedTime,
        notes: form.notes.trim() || undefined,
      })
      setSuccess(result)
      setForm(f => ({ ...f, notes: '' }))
      setSelectedDate('')
      setSelectedTime('')
    } catch (err) {
      setError(err.message || 'Failed to book slot')
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
    <div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Book Pickup Slot</h2>
      <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
        Select a convenient time to pick up your medicines — no waiting in line.
      </p>

      {success && (
        <div className="alert alert-success">
          <CheckCircle size={20} />
          <div>
            <strong>Slot booked successfully!</strong>
            <p style={{ marginTop: '0.25rem' }}>
              Pickup on <strong>{new Date(success.pickup_date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}</strong> at <strong>{formatTime(success.pickup_time)}</strong>
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Your Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter your full name"
              value={form.customer_name}
              onChange={(e) => setForm(f => ({ ...f, customer_name: e.target.value }))}
              required
              readOnly={!!user?.name}
              style={user?.name ? { background: 'var(--border-light)', cursor: 'default' } : {}}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number *</label>
            <input
              type="tel"
              className="form-input"
              placeholder="+91 98765 43210"
              value={form.customer_phone}
              onChange={(e) => setForm(f => ({ ...f, customer_phone: e.target.value }))}
              required
              readOnly={!!user?.phone}
              style={user?.phone ? { background: 'var(--border-light)', cursor: 'default' } : {}}
            />
          </div>
        </div>

        {/* Date Selection */}
        <div className="form-group">
          <label className="form-label"><Calendar size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Select Date *</label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {dates.map(date => (
              <button
                key={date}
                type="button"
                className={`slot-btn ${selectedDate === date ? 'selected' : ''}`}
                onClick={() => setSelectedDate(date)}
                style={{ minWidth: '90px', padding: '0.625rem 0.75rem' }}
              >
                {formatDate(date)}
              </button>
            ))}
          </div>
        </div>

        {/* Time Slots */}
        {selectedDate && (
          <div className="form-group">
            <label className="form-label">
              <Clock size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Select Time *
              {loadingSlots && <span className="text-muted" style={{ fontWeight: 400 }}> (loading...)</span>}
            </label>
            <div className="slot-grid">
              {timeSlots.map(time => {
                const isBooked = bookedTimes.includes(time)
                return (
                  <button
                    key={time}
                    type="button"
                    className={`slot-btn ${selectedTime === time ? 'selected' : ''}`}
                    onClick={() => !isBooked && setSelectedTime(time)}
                    disabled={isBooked}
                    title={isBooked ? 'This slot is already booked' : ''}
                  >
                    {formatTime(time)}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Notes (optional)</label>
          <textarea
            className="form-textarea"
            placeholder="Any notes for the pharmacy..."
            value={form.notes}
            onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
            rows={2}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg w-full"
          disabled={loading.bookSlot || !selectedDate || !selectedTime}
        >
          {loading.bookSlot ? (
            <><div className="spinner" style={{ width: '1.25rem', height: '1.25rem', borderWidth: '2px' }} /> Booking...</>
          ) : (
            <><Clock size={20} /> Book Pickup Slot</>
          )}
        </button>
      </form>
    </div>
  )
}

export default SlotBooking
