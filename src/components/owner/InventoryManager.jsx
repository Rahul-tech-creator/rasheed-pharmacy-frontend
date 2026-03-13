import React, { useState, useEffect } from 'react'
import {
  Plus, Search, Trash2, ShoppingCart, Edit2, X, AlertTriangle,
  ArrowUpDown, Filter, Package
} from 'lucide-react'
import { usePharmacy } from '../../context/PharmacyContext'

const InventoryManager = () => {
  const {
    medicines, fetchMedicines, addMedicine, updateMedicine,
    sellMedicine, deleteMedicine, loading
  } = usePharmacy()

  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingMed, setEditingMed] = useState(null)
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')
  const [filterLow, setFilterLow] = useState(false)
  const [formData, setFormData] = useState({
    name: '', price: '', stock: '', category: 'General', expiry_date: ''
  })
  const [formError, setFormError] = useState(null)
  const [actionFeedback, setActionFeedback] = useState(null)

  useEffect(() => {
    fetchMedicines({ search: searchQuery, sort_by: sortBy, order: sortOrder, low_stock: filterLow || undefined })
  }, [searchQuery, sortBy, sortOrder, filterLow, fetchMedicines])

  const showFeedback = (msg, type = 'success') => {
    setActionFeedback({ msg, type })
    setTimeout(() => setActionFeedback(null), 3000)
  }

  const resetForm = () => {
    setFormData({ name: '', price: '', stock: '', category: 'General', expiry_date: '' })
    setFormError(null)
  }

  const openAddModal = () => {
    resetForm()
    setEditingMed(null)
    setShowAddModal(true)
  }

  const openEditModal = (med) => {
    setFormData({
      name: med.name,
      price: med.price.toString(),
      stock: med.stock.toString(),
      category: med.category,
      expiry_date: med.expiry_date,
    })
    setEditingMed(med)
    setFormError(null)
    setShowAddModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)
    const data = {
      name: formData.name.trim(),
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      category: formData.category.trim(),
      expiry_date: formData.expiry_date,
    }

    if (!data.name || isNaN(data.price) || isNaN(data.stock) || !data.expiry_date) {
      setFormError('Please fill all required fields correctly')
      return
    }

    try {
      if (editingMed) {
        await updateMedicine(editingMed.id, data)
        showFeedback(`"${data.name}" updated successfully`)
      } else {
        await addMedicine(data)
        showFeedback(`"${data.name}" added to inventory`)
      }
      setShowAddModal(false)
      resetForm()
    } catch (err) {
      setFormError(err.message)
    }
  }

  const handleSell = async (med) => {
    try {
      await sellMedicine(med.id, 1)
      showFeedback(`Sold 1 unit of "${med.name}"`)
    } catch (err) {
      showFeedback(err.message, 'error')
    }
  }

  const handleDelete = async (med) => {
    if (!confirm(`Delete "${med.name}" from inventory?`)) return
    try {
      await deleteMedicine(med.id)
      showFeedback(`"${med.name}" deleted`)
    } catch (err) {
      showFeedback(err.message, 'error')
    }
  }

  const isExpiringSoon = (date) => {
    const expiry = new Date(date)
    const limit = new Date()
    limit.setMonth(limit.getMonth() + 3)
    return expiry <= limit
  }

  const isExpired = (date) => new Date(date) <= new Date()

  const toggleSort = (col) => {
    if (sortBy === col) {
      setSortOrder(o => o === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(col)
      setSortOrder('asc')
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Inventory Management</h1>
          <p className="text-muted">Add, edit, sell, and track your medicine stock</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} /> Add Medicine
        </button>
      </div>

      {actionFeedback && (
        <div className={`alert ${actionFeedback.type === 'error' ? 'alert-error' : 'alert-success'}`}>
          {actionFeedback.msg}
        </div>
      )}

      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: '200px' }}>
          <Search size={18} className="search-icon" />
          <input
            placeholder="Search medicines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          className={`btn ${filterLow ? 'btn-warning' : 'btn-outline'} btn-sm`}
          onClick={() => setFilterLow(!filterLow)}
        >
          <AlertTriangle size={16} /> Low Stock
        </button>
      </div>

      {/* Table */}
      {loading.medicines ? (
        <div className="loading-overlay"><div className="spinner" /></div>
      ) : medicines.length === 0 ? (
        <div className="empty-state">
          <Package size={48} className="empty-icon" />
          <h3>No medicines found</h3>
          <p>Add your first medicine to get started.</p>
          <button className="btn btn-primary mt-md" onClick={openAddModal}>
            <Plus size={18} /> Add Medicine
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th onClick={() => toggleSort('name')} style={{ cursor: 'pointer' }}>
                  Name <ArrowUpDown size={12} style={{ opacity: 0.5 }} />
                </th>
                <th>Category</th>
                <th onClick={() => toggleSort('price')} style={{ cursor: 'pointer' }}>
                  Price <ArrowUpDown size={12} style={{ opacity: 0.5 }} />
                </th>
                <th onClick={() => toggleSort('stock')} style={{ cursor: 'pointer' }}>
                  Stock <ArrowUpDown size={12} style={{ opacity: 0.5 }} />
                </th>
                <th onClick={() => toggleSort('expiry_date')} style={{ cursor: 'pointer' }}>
                  Expiry <ArrowUpDown size={12} style={{ opacity: 0.5 }} />
                </th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map(med => (
                <tr key={med.id}>
                  <td><strong>{med.name}</strong></td>
                  <td><span className="badge badge-neutral">{med.category}</span></td>
                  <td>₹{med.price}</td>
                  <td>
                    <span style={{ fontWeight: 600, color: med.stock === 0 ? 'var(--danger)' : med.stock <= 10 ? 'var(--warning)' : 'var(--text-main)' }}>
                      {med.stock}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8125rem' }}>
                    {new Date(med.expiry_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                  </td>
                  <td>
                    {isExpired(med.expiry_date) ? (
                      <span className="badge badge-danger">Expired</span>
                    ) : isExpiringSoon(med.expiry_date) ? (
                      <span className="badge badge-warning">Expiring Soon</span>
                    ) : med.stock === 0 ? (
                      <span className="badge badge-danger">Out of Stock</span>
                    ) : med.stock <= 10 ? (
                      <span className="badge badge-warning">Low Stock</span>
                    ) : (
                      <span className="badge badge-success">OK</span>
                    )}
                  </td>
                  <td>
                    <div className="actions">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleSell(med)}
                        disabled={med.stock === 0}
                        title="Sell 1 unit"
                      >
                        <ShoppingCart size={14} /> Sell
                      </button>
                      <button className="btn btn-outline btn-sm btn-icon" onClick={() => openEditModal(med)} title="Edit">
                        <Edit2 size={14} />
                      </button>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => handleDelete(med)} title="Delete" style={{ color: 'var(--danger)' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingMed ? 'Edit Medicine' : 'Add New Medicine'}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                <AlertTriangle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Medicine Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Paracetamol 500mg"
                  value={formData.name}
                  onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Price (₹) *</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData(f => ({ ...f, price: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Quantity *</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData(f => ({ ...f, stock: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData(f => ({ ...f, category: e.target.value }))}
                  >
                    {['General', 'Antibiotic', 'Antihistamine', 'Diabetes', 'Pain Relief',
                      'Cardiac', 'Vitamins', 'Skin Care', 'Ayurvedic', 'Other'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Expiry Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData(f => ({ ...f, expiry_date: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading.addMedicine || loading.updateMedicine}>
                  {editingMed ? 'Save Changes' : 'Add Medicine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default InventoryManager
