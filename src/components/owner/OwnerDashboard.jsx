import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, ClipboardList, Calendar, Home, LogOut, Shield } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import DashboardOverview from './DashboardOverview'
import InventoryManager from './InventoryManager'
import PrescriptionManager from './PrescriptionManager'
import PickupSchedule from './PickupSchedule'

const sections = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'prescriptions', label: 'Prescriptions', icon: ClipboardList },
  { id: 'schedule', label: 'Pickup Schedule', icon: Calendar },
]

const OwnerDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview')
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div style={{ padding: '0 1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Shield size={18} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1rem', color: 'var(--primary-dark)' }}>Owner Dashboard</h3>
          </div>
          <p className="text-muted" style={{ fontSize: '0.75rem' }}>
            {user?.name || 'Pharmacy Owner'}
          </p>
        </div>
        <div className="sidebar-title">Navigation</div>
        <nav className="sidebar-nav">
          {sections.map(section => (
            <button
              key={section.id}
              className={`sidebar-link ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <section.icon size={18} />
              {section.label}
            </button>
          ))}
        </nav>
        
        <div style={{ marginTop: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link to="/" className="btn btn-outline w-full" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <Home size={16} />
            Back to Storefront
          </Link>
          <button onClick={handleLogout} className="btn btn-ghost w-full" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', color: 'var(--danger)' }}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <div className="dashboard-content">
        {activeSection === 'overview' && <DashboardOverview />}
        {activeSection === 'inventory' && <InventoryManager />}
        {activeSection === 'prescriptions' && <PrescriptionManager />}
        {activeSection === 'schedule' && <PickupSchedule />}
      </div>
    </div>
  )
}

export default OwnerDashboard
