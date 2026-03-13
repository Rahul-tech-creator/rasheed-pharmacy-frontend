import React, { useState } from 'react'
import { Upload, Search, Clock, ClipboardList, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import PrescriptionUpload from './PrescriptionUpload'
import OrderStatus from './OrderStatus'
import SlotBooking from './SlotBooking'
import MedicineSearch from './MedicineSearch'

const tabs = [
  { id: 'upload', label: 'Upload Prescription', icon: Upload },
  { id: 'track', label: 'Track Order', icon: ClipboardList },
  { id: 'booking', label: 'Book Pickup', icon: Clock },
  { id: 'search', label: 'Find Medicines', icon: Search },
]

const CustomerPortal = () => {
  const [activeTab, setActiveTab] = useState('upload')
  const { user } = useAuth()

  return (
    <div className="portal-container animate-fade-in">
      <div className="portal-header">
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'var(--primary-light)',
          color: 'var(--primary-dark)',
          padding: '0.375rem 1rem',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.875rem',
          fontWeight: 600,
          marginBottom: '0.75rem',
        }}>
          <User size={14} />
          Welcome, {user?.name || 'Customer'}
        </div>
        <h1>Customer Portal</h1>
        <p className="text-muted">Upload prescriptions, track orders, book pickups, and search medicines</p>
      </div>

      <div className="tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        {activeTab === 'upload' && <PrescriptionUpload />}
        {activeTab === 'track' && <OrderStatus />}
        {activeTab === 'booking' && <SlotBooking />}
        {activeTab === 'search' && <MedicineSearch />}
      </div>
    </div>
  )
}

export default CustomerPortal
