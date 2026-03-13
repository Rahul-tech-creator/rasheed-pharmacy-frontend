import React, { useState, useEffect, useCallback } from 'react'
import { Search, Pill, AlertCircle, ShoppingCart, Plus, Minus, Trash2, CheckCircle } from 'lucide-react'
import { medicinesApi } from '../../api/pharmacyApi'
import { usePharmacy } from '../../context/PharmacyContext'

const MedicineSearch = () => {
  const { uploadPrescription } = usePharmacy()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [allMedicines, setAllMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Cart state
  const [cart, setCart] = useState({})
  const [orderForm, setOrderForm] = useState({ customer_name: '', customer_phone: '', notes: '' })
  const [orderError, setOrderError] = useState(null)
  const [orderSuccess, setOrderSuccess] = useState(null)
  const [isOrdering, setIsOrdering] = useState(false)

  const fetchMedicines = useCallback(() => {
    setLoading(true)
    medicinesApi.getAll({ sort_by: 'name', order: 'asc' })
      .then(res => {
        setAllMedicines(res.data)
        setResults(res.data)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchMedicines()
  }, [fetchMedicines])

  const handleSearch = useCallback((searchQuery) => {
    setQuery(searchQuery)
    if (!searchQuery.trim()) {
      setResults(allMedicines)
      return
    }
    const q = searchQuery.toLowerCase()
    setResults(allMedicines.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q)
    ))
  }, [allMedicines])

  const getStockBadge = (stock) => {
    if (stock === 0) return <span className="badge badge-danger">Out of Stock</span>
    if (stock <= 10) return <span className="badge badge-warning">Low Stock</span>
    return <span className="badge badge-success">In Stock</span>
  }

  const handleUpdateCart = (med, delta, inputVal = null) => {
    setOrderError(null)
    setOrderSuccess(null)
    
    setCart(prev => {
      const currentQty = prev[med.id]?.quantity || 0
      let newQty = inputVal !== null ? inputVal : currentQty + delta

      if (newQty <= 0) {
        const newCart = { ...prev }
        delete newCart[med.id]
        return newCart
      }

      if (newQty > med.stock) {
        setOrderError(`Only ${med.stock} units of ${med.name} are available. You can place an order for up to ${med.stock}.`)
        newQty = med.stock // Clamp to max available
      }

      return {
        ...prev,
        [med.id]: { medicine: med, quantity: newQty }
      }
    })
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    setOrderError(null)
    setOrderSuccess(null)

    if (!orderForm.customer_name.trim() || !orderForm.customer_phone.trim()) {
      setOrderError('Name and phone number are required to place an order.')
      return
    }

    const items = Object.values(cart).map(c => ({
      medicine_id: c.medicine.id,
      quantity: c.quantity
    }))

    if (items.length === 0) {
      setOrderError('Your cart is empty.')
      return
    }

    setIsOrdering(true)
    try {
      const formData = new FormData()
      formData.append('customer_name', orderForm.customer_name.trim())
      formData.append('customer_phone', orderForm.customer_phone.trim())
      if (orderForm.notes.trim()) formData.append('notes', orderForm.notes.trim())
      formData.append('items', JSON.stringify(items))

      const result = await uploadPrescription(formData) // Re-using context function which posts to /api/prescriptions
      
      setOrderSuccess(`Order placed successfully! Your Order ID is #${result.id}. Save this ID or use your phone number to track it.`)
      setCart({})
      setOrderForm({ customer_name: '', customer_phone: '', notes: '' })
      fetchMedicines() // Refresh to get updated stock
    } catch (err) {
      setOrderError(err.message || 'Failed to place order')
    } finally {
      setIsOrdering(false)
    }
  }

  const cartItems = Object.values(cart)
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.medicine.price * item.quantity), 0)

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Find & Order Medicines</h2>
      <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
        Check availability and order medicines directly for pickup.
      </p>

      {/* Cart Section */}
      {cartItems.length > 0 && (
        <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--primary-light)', border: '1px solid var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <ShoppingCart size={20} className="text-primary-dark" />
            <h3 style={{ fontSize: '1.125rem', color: 'var(--primary-dark)' }}>Your Selection</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {cartItems.map(item => (
              <div key={item.medicine.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{item.medicine.name}</div>
                  <div className="text-muted" style={{ fontSize: '0.8125rem' }}>₹{item.medicine.price} x {item.quantity}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontWeight: 700 }}>₹{(item.medicine.price * item.quantity).toFixed(2)}</span>
                  <button className="btn btn-ghost btn-sm btn-icon" onClick={() => handleUpdateCart(item.medicine, 0, 0)} style={{ color: 'var(--danger)' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', fontWeight: 700, fontSize: '1.125rem', borderTop: '2px dashed var(--primary)' }}>
              <span>Total Estimated:</span>
              <span>₹{cartTotal.toFixed(2)}</span>
            </div>
          </div>

          <form onSubmit={handlePlaceOrder}>
            <div className="form-row">
              <input 
                type="text" 
                className="form-input" 
                placeholder="Your Name *" 
                value={orderForm.customer_name}
                onChange={e => setOrderForm(f => ({ ...f, customer_name: e.target.value }))}
                required 
              />
              <input 
                type="tel" 
                className="form-input" 
                placeholder="Phone Number *" 
                value={orderForm.customer_phone}
                onChange={e => setOrderForm(f => ({ ...f, customer_phone: e.target.value }))}
                required 
              />
            </div>
            <textarea 
              className="form-input" 
              placeholder="Notes (optional)" 
              value={orderForm.notes}
              onChange={e => setOrderForm(f => ({ ...f, notes: e.target.value }))}
              style={{ marginTop: '0.75rem', marginBottom: '0.75rem' }}
            />
            <button type="submit" className="btn btn-primary w-full" disabled={isOrdering}>
              {isOrdering ? 'Placing Order...' : 'Place Pickup Order'}
            </button>
          </form>
        </div>
      )}

      {orderSuccess && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          <CheckCircle size={20} />
          <span>{orderSuccess}</span>
        </div>
      )}

      {orderError && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={20} />
          <span>{orderError}</span>
        </div>
      )}

      <div className="search-bar" style={{ marginBottom: '1.5rem' }}>
        <Search size={20} className="search-icon" />
        <input
          type="text"
          placeholder="Search by medicine name or category..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {error && !orderError && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="loading-overlay">
          <div className="spinner" />
        </div>
      ) : results.length === 0 ? (
        <div className="empty-state">
          <Pill size={48} className="empty-icon" />
          <h3>No medicines found</h3>
          <p>{query ? 'Try a different search term.' : 'No medicines in inventory yet.'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {results.map(med => {
            const isExpired = new Date(med.expiry_date) <= new Date()
            const cartQty = cart[med.id]?.quantity || 0
            
            return (
              <div
                key={med.id}
                className="card"
                style={{
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <h4 style={{ fontSize: '0.9375rem', marginBottom: '0.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {med.name}
                    {isExpired && <span className="badge badge-danger" style={{ fontSize: '0.6875rem' }}>Expired</span>}
                  </h4>
                  <p className="text-muted" style={{ fontSize: '0.8125rem' }}>
                    {med.category} · ₹{med.price}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {getStockBadge(med.stock)}
                  
                  {!isExpired && med.stock > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-main)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
                      {cartQty > 0 ? (
                        <>
                          <button className="btn btn-outline btn-sm btn-icon" onClick={() => handleUpdateCart(med, -1)}>
                            <Minus size={14} />
                          </button>
                          <span style={{ fontWeight: 600, width: '2rem', textAlign: 'center' }}>{cartQty}</span>
                          <button className="btn btn-outline btn-sm btn-icon" onClick={() => handleUpdateCart(med, 1)}>
                            <Plus size={14} />
                          </button>
                        </>
                      ) : (
                        <button className="btn btn-outline btn-sm" onClick={() => handleUpdateCart(med, 1)}>
                          Add to Order
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default MedicineSearch
