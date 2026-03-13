import React, { useEffect, useState } from 'react'
import { Package, AlertTriangle, ClipboardList, Clock, TrendingUp, Pill } from 'lucide-react'
import { usePharmacy } from '../../context/PharmacyContext'

const statusBadge = (status) => {
  switch (status) {
    case 'Ready for Pickup': return 'badge-success';
    case 'Preparing Order': return 'badge-warning';
    case 'Checking Medicines': return 'badge-info';
    case 'Completed': return 'badge-neutral';
    default: return 'badge-info';
  }
}

const DashboardOverview = () => {
  const { fetchStats, fetchPrescriptions, fetchSlots, prescriptions, slots, stats } = usePharmacy()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetchStats(),
      fetchPrescriptions(),
      fetchSlots(),
    ]).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="loading-overlay"><div className="spinner" /></div>
  }

  const pendingOrders = prescriptions.filter(p => !['Ready for Pickup', 'Completed'].includes(p.status)).length
  const todayStr = new Date().toISOString().split('T')[0]
  const todaySlots = slots.filter(s => s.pickup_date === todayStr).length
  const recentOrders = prescriptions.slice(0, 5)

  return (
    <div className="animate-fade-in">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <p className="text-muted">Real-time pharmacy operations summary</p>
      </div>

      <div className="stats-grid">
        {[
          { icon: Package, label: 'Total Medicines', value: stats?.total || 0, color: 'var(--primary)', bg: 'var(--primary-light)' },
          { icon: AlertTriangle, label: 'Low Stock Items', value: stats?.lowStock || 0, color: 'var(--warning)', bg: 'var(--warning-light)' },
          { icon: ClipboardList, label: 'Pending Orders', value: pendingOrders, color: 'var(--info)', bg: 'var(--info-light)' },
          { icon: Clock, label: "Today's Pickups", value: todaySlots, color: 'var(--accent)', bg: 'var(--accent-light)' },
          { icon: TrendingUp, label: 'Inventory Value', value: `₹${(stats?.totalValue || 0).toLocaleString()}`, color: 'var(--secondary)', bg: 'var(--secondary-light)' },
          { icon: Pill, label: 'Out of Stock', value: stats?.outOfStock || 0, color: 'var(--danger)', bg: 'var(--danger-light)' },
        ].map(stat => (
          <div key={stat.label} className="stat-card">
            <div className="stat-icon" style={{ background: stat.bg, color: stat.color }}>
              <stat.icon size={20} />
            </div>
            <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="card" style={{ marginTop: '1rem' }}>
        <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Recent Prescriptions</h3>
        {recentOrders.length === 0 ? (
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>No prescriptions yet.</p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id}>
                    <td><strong>#{order.id}</strong></td>
                    <td>{order.customer_name}</td>
                    <td>{order.customer_phone}</td>
                    <td>
                      <span className={`badge ${statusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="text-muted" style={{ fontSize: '0.8125rem' }}>
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
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

export default DashboardOverview
